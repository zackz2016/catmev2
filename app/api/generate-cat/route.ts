import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CatPrompt } from '@/types/quiz';
import { supabase } from '@/lib/supabase';

const GEMINI_PROXY_BASE_URL = process.env.GEMINI_PROXY_URL;

enum Modality {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',  
}

export async function POST(request: Request) {
  try {
    // 验证用户身份
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to generate cat images' },
        { status: 401 }
      );
    }

    const { prompt } = await request.json() as { prompt: CatPrompt };
    
    // 检查用户积分
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

    // 如果用户没有积分记录，创建一个（新用户默认1积分）
    let currentPoints = userPoints?.points || 0;
    if (pointsError?.code === 'PGRST116') {
      const { data: newPoints, error: createError } = await supabase
        .from('user_points')
        .insert([{ user_id: userId, points: 1 }])
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
        { status: 402 } // 402 Payment Required
      );
    }

    // 构建图片生成提示词
    const imagePrompt = `Generate a stunning, high-quality, and artistically refined image of a ${prompt.breed} cat`+
    `${prompt.style} style, emphasizing intricate details and vibrant colors.`+
    `The cat should be ${prompt.pose} pose and with ${prompt.expression} expression, clearly conveying a ${prompt.personality} personality. `+
    `The overall aesthetic should be exceptionally cute and charming.`;

    // 构建完整的反向代理URL
    const fullProxyUrl = `${GEMINI_PROXY_BASE_URL}/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent`;

    // 调用API生图
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
          responseModalities: [Modality.TEXT, Modality.IMAGE], // 指定响应MIME类型，请求图像和文本
       },
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    let imageUrl = '';

    for (const part of data.candidates[0].content.parts) {
      // Based on the part type, either show the text or save the image
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data; 
        imageUrl = `data:${part.inlineData.mimeType};base64,${imageData}`;
        
        // 图片生成成功，扣减1积分
        const { data: updatedPoints, error: deductError } = await supabase.rpc(
          'update_user_points',
          {
            p_user_id: userId,
            p_amount: 1,
            p_type: 'SPEND',
            p_reason: 'Generated cat image'
          }
        );

        if (deductError) {
          console.error('Error deducting points:', deductError);
          // 即使积分扣减失败，也返回图片（但记录错误）
          // 可以考虑在这里实现补偿机制
        }

        return NextResponse.json({ 
          imageUrl,
          pointsRemaining: updatedPoints || (currentPoints - 1)
        });
      }
    }

    // 如果没有生成图片
    throw new Error('No image generated');
  
  } catch (error) {
    console.error('Error generating cat image:', error);
    return NextResponse.json(
      { error: 'Failed to generate cat image' },
      { status: 500 }
    );
  }
}   