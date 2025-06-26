// TUZI AI 图像生成API路由 - 使用OpenAI官方SDK的images API
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CatPrompt } from '@/types/quiz';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

// TUZI API配置 - 从环境变量获取
const TUZI_API_KEY = process.env.TUZI_API_KEY;
const TUZI_API_BASE = process.env.TUZI_API_BASE;

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
    const imagePrompt = `Generate a stunning, high-quality, and artistically refined image of a ${prompt.breed} cat ` +
      `${prompt.style} style, emphasizing intricate details and vibrant colors. ` +
      `The cat should be ${prompt.pose} pose and with ${prompt.expression} expression, clearly conveying a ${prompt.personality} personality. ` +
      `The overall aesthetic should be exceptionally cute and charming.`;

    // 初始化OpenAI客户端
    const openai = new OpenAI({
      apiKey: TUZI_API_KEY,
      baseURL: TUZI_API_BASE
    });

    // 调用TUZI API生图 - 使用OpenAI官方SDK的images API
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt,
      // n: 1, // 生成1张图片
      size: "1024x1024", // 图片尺寸
      quality: "medium",
      // response_format: "b64_json", // 返回base64格式
    });

    // 调试：记录响应结构
    console.log('TUZI API Response:', JSON.stringify(result, null, 2));

    let imageUrl = '';

    // 处理images API的标准返回格式
    if (result.data && result.data.length > 0) {
      const imageData = result.data[0];
      
      if (imageData.b64_json) {
        // base64格式
        imageUrl = `data:image/png;base64,${imageData.b64_json}`;
      } else if (imageData.url) {
        // URL格式
        imageUrl = imageData.url;
      }
    }

    if (!imageUrl) {
      throw new Error('No image data returned from TUZI API');
    }

    // 图片生成成功，扣减1积分
    const { data: updatedPoints, error: deductError } = await supabase.rpc(
      'update_user_points',
      {
        p_user_id: userId,
        p_amount: 1,
        p_type: 'SPEND',
        p_reason: 'Generated cat image (TUZI API)'
      }
    );

    if (deductError) {
      console.error('Error deducting points:', deductError);
      // 即使积分扣减失败，也返回图片（但记录错误）
      // 可以考虑在这里实现补偿机制
    }

    return NextResponse.json({ 
      imageUrl,
      pointsRemaining: updatedPoints || (currentPoints - 1),
      provider: 'TUZI' // 标识使用的API提供商
    });

  } catch (error) {
    console.error('Error generating cat image with TUZI API:', error);
    return NextResponse.json(
      { error: 'Failed to generate cat image' },
      { status: 500 }
    );
  }
} 