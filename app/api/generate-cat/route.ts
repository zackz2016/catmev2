import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CatPrompt } from '@/types/quiz';
import { supabase } from '@/lib/supabase';
import { getClientIP, generateBrowserFingerprint } from '@/lib/guest-trial';

const GEMINI_PROXY_BASE_URL = process.env.GEMINI_PROXY_URL;

enum Modality {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',  
}

// 服务端访客试用检查
async function checkGuestTrialEligibility(request: Request): Promise<{ canUse: boolean; reason?: string }> {
  const clientIP = getClientIP(request);
  const fingerprint = generateBrowserFingerprint(request);
  
  // 查询今天是否已经使用过免费试用
  const today = new Date().toISOString().split('T')[0];
  
  const { data: existingTrial, error } = await supabase
    .from('guest_trials')
    .select('*')
    .eq('client_ip', clientIP)
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lt('created_at', `${today}T23:59:59.999Z`)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking guest trial:', error);
    return { canUse: false, reason: 'Database error' };
  }

  if (existingTrial) {
    return { canUse: false, reason: 'Daily trial limit reached' };
  }

  return { canUse: true };
}

// 记录访客试用使用
async function recordGuestTrialUsage(request: Request): Promise<void> {
  const clientIP = getClientIP(request);
  const fingerprint = generateBrowserFingerprint(request);
  
  await supabase
    .from('guest_trials')
    .insert([{
      client_ip: clientIP,
      browser_fingerprint: fingerprint,
      created_at: new Date().toISOString()
    }]);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;
    const { prompt } = await request.json() as { prompt: CatPrompt };
    
    let currentPoints = 0;
    let isGuestMode = false;

    if (!userId) {
      // 访客模式：信任前端的试用次数管理
      // 前端已经通过localStorage检查并消费了试用次数
      // 这里不再进行额外的服务端检查，避免双重验证
      isGuestMode = true;
      console.log('🐱 API: Guest mode detected, trusting frontend trial management');
    } else {
      // 注册用户模式：检查积分
      const { data: userPoints, error: pointsError } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', userId)
        .single();

      if (pointsError && pointsError.code !== 'PGRST116') {
        console.error('Error fetching user points:', pointsError);
        return NextResponse.json(
          { error: 'Failed to check user points' },
          { status: 500 }
        );
      }

      // 如果用户没有积分记录，创建一个（新用户默认3积分）
      currentPoints = userPoints?.points || 0;
      if (pointsError?.code === 'PGRST116') {
        const { data: newPoints, error: createError } = await supabase
          .from('user_points')
          .insert([{ user_id: userId, points: 3 }])
          .select()
          .single();

        if (createError) {
          console.error('Error creating user points:', createError);
          return NextResponse.json(
            { error: 'Failed to initialize user points' },
            { status: 500 }
          );
        }
        currentPoints = newPoints.points;
      }

      // 检查是否有足够积分（生成图片需要1积分）
      if (currentPoints < 1) {
        return NextResponse.json(
          { error: 'Insufficient points. You need at least 1 point to generate a cat image.' },
          { status: 402 }
        );
      }
    }

    // 构建增强版图片生成提示词
    let imagePrompt = `Generate a stunning, high-quality, and artistically refined ${prompt.style} style image of a ${prompt.breed} cat, emphasizing intricate details and vibrant colors. `;
    
    // 添加姿势和表情描述
    imagePrompt += `The cat should be in a ${prompt.pose} pose with a ${prompt.expression} expression, clearly conveying a ${prompt.personality} personality. `;
    
    // 添加环境和氛围描述（如果有的话）
    if (prompt.environment) {
      imagePrompt += `The scene should be set in a ${prompt.environment} environment. `;
    }
    
    if (prompt.mood) {
      imagePrompt += `The overall atmosphere should feel ${prompt.mood}. `;
    }
    
    // 添加颜色和配饰描述（如果有的话）
    if (prompt.color) {
      imagePrompt += `Pay special attention to the ${prompt.color} color scheme. `;
    }
    
    if (prompt.accessory) {
      imagePrompt += `The cat should be wearing or accompanied by ${prompt.accessory}. `;
    }
    
    // 结尾要求
    imagePrompt += `The overall aesthetic should be exceptionally cute, charming, and visually appealing. Ensure the image captures the unique personality and charm of this specific cat character.`;

    console.log('Generated image prompt:', imagePrompt);
    console.log('🎨 API: GEMINI_PROXY_BASE_URL:', GEMINI_PROXY_BASE_URL);

    // 检查环境变量
    if (!GEMINI_PROXY_BASE_URL) {
      console.error('🚨 GEMINI_PROXY_BASE_URL not configured');
      throw new Error('Image generation service not configured');
    }

    // 构建完整的反向代理URL
    const fullProxyUrl = `${GEMINI_PROXY_BASE_URL}/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent`;
    console.log('🎨 API: Full proxy URL:', fullProxyUrl);

    // 调用API生图
    console.log('🎨 API: Calling Gemini API...');
    const response = await fetch(fullProxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents: [{
          parts: [{
            text: imagePrompt
          }]
        }],
        generationConfig: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
       },
      })
    });

    console.log('🎨 API: Gemini response status:', response.status);
    if (!response.ok) {
      const errorText = await response.text();
      console.error('🎨 API: Gemini error:', errorText);
      throw new Error(`Failed to generate image: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('🎨 API: Gemini response data structure:', JSON.stringify(data, null, 2));
    let imageUrl = '';

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      console.error('🎨 API: Invalid response structure');
      throw new Error('Invalid response structure from image generation API');
    }

    for (const part of data.candidates[0].content.parts) {
      if (part.text) {
        console.log('🎨 Generated image description:', part.text);
      } else if (part.inlineData) {
        console.log('🎨 Found inline image data, mimeType:', part.inlineData.mimeType);
        const imageData = part.inlineData.data; 
        imageUrl = `data:${part.inlineData.mimeType};base64,${imageData}`;
        console.log('🎨 Generated imageUrl length:', imageUrl.length);
        
        if (isGuestMode) {
          // 访客模式：可选的使用记录（用于统计）
          try {
            await recordGuestTrialUsage(request);
          } catch (error) {
            console.warn('Failed to record guest trial usage:', error);
            // 不影响图片生成，继续处理
          }
          
          console.log('🐱 API: Guest image generated successfully');
          return NextResponse.json({ 
            imageUrl,
            isGuestMode: true,
            message: '免费体验已使用，注册后可获得更多次数',
            prompt: imagePrompt
          });
        } else {
          // 注册用户模式：扣减积分
          const { data: updatedPoints, error: deductError } = await supabase.rpc(
            'update_user_points',
            {
              p_user_id: userId,
              p_amount: 1,
              p_type: 'SPEND',
              p_reason: 'Generated AI random quiz cat image'
            }
          );

          if (deductError) {
            console.error('Error deducting points:', deductError);
          }

          return NextResponse.json({ 
            imageUrl,
            pointsRemaining: updatedPoints || (currentPoints - 1),
            isGuestMode: false,
            prompt: imagePrompt
          });
        }
      }
    }

    throw new Error('No image generated');
  
  } catch (error) {
    console.error('Error generating cat image:', error);
    return NextResponse.json(
      { error: 'Failed to generate cat image' },
      { status: 500 }
    );
  }
}   