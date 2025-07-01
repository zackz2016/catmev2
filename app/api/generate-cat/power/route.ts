// 新版本图片生成API - 使用Imagen 4.0测试
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { CatPrompt } from '@/types/quiz';
import { supabase } from '@/lib/supabase';
import { detectUserPlan } from '@/lib/image-generator/plan-detector';
import { generateImageWithVertexAI, checkVertexAIAvailability } from '@/lib/image-generator/vertex-imagen';
import { buildImagePrompt } from '@/lib/prompt-builder';
import { isProxyConfigured, getProxyInfo } from '@/lib/proxy-config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 新的Imagen 4.0 API生成函数
async function generateImageWithImagen4(prompt: CatPrompt): Promise<{ imageUrl: string; prompt: string }> {
  // 使用统一的提示词构建函数
  const imagePrompt = buildImagePrompt(prompt);

  console.log('🎨 Imagen 4.0 API: 开始生成图片...');
  
  // 输出代理配置状态
  if (isProxyConfigured()) {
    const proxyInfo = getProxyInfo();
    console.log('🔗 Imagen 4.0 API: 全局代理已启用，将通过代理访问Google服务');
    console.log('🔗 代理配置:', { 
      https: proxyInfo.httpsProxy ? '✅ 已配置' : '❌ 未配置',
      http: proxyInfo.httpProxy ? '✅ 已配置' : '❌ 未配置'
    });
  } else {
    console.log('ℹ️ Imagen 4.0 API: 未检测到代理配置，将直接访问Google服务');
  }

  // 新的Imagen 4.0 API端点
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-preview-06-06:predict`;

  // 使用Node.js原生HTTPS模块确保代理支持
  const https = require('https');
  const url = require('url');
  
  const requestBody = JSON.stringify({
    instances: [
      {
        prompt: imagePrompt
      }
    ],
    parameters: {
      sampleCount: 1     
    }
  });
  
  const urlParsed = new URL(apiUrl);
  
  const requestOptions = {
    hostname: urlParsed.hostname,
    port: urlParsed.port || 443,
    path: urlParsed.pathname + urlParsed.search,
    method: 'POST',
    headers: {
      'x-goog-api-key': GEMINI_API_KEY,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestBody)
    }
  };

  // 如果配置了代理，全局代理agent会自动使用
  if (isProxyConfigured()) {
    console.log('🔗 Imagen 4.0 API: 使用HTTPS模块通过全局代理发送请求');
  }
  
  // 发送HTTPS请求
  const response = await new Promise<any>((resolve, reject) => {
    const req = https.request(requestOptions, (res: any) => {
      let data = '';
      res.on('data', (chunk: any) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          statusText: res.statusMessage,
          ok: res.statusCode >= 200 && res.statusCode < 300,
          json: () => Promise.resolve(JSON.parse(data)),
          text: () => Promise.resolve(data)
        });
      });
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.setTimeout(30000); // 30秒超时
    
    req.write(requestBody);
    req.end();
  });

  console.log('🎨 Imagen 4.0 API: 响应状态:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.error('🎨 Imagen 4.0 API: 生成失败:', errorText);
    throw new Error(`Failed to generate image: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  // 简化日志 - 不输出完整数据结构，避免控制台被base64数据刷屏
  console.log('🎨 Imagen 4.0 API: 收到响应，预测数量:', data.predictions?.length || 0);

  if (!data.predictions || !data.predictions[0]) {
    console.error('🎨 Imagen 4.0 API: 响应结构无效');
    throw new Error('Invalid response structure from Imagen 4.0 API');
  }

  const prediction = data.predictions[0];
  if (prediction.bytesBase64Encoded) {
    console.log('🎨 找到图片数据 (Imagen 4.0)');
    const imageData = prediction.bytesBase64Encoded;
    const imageUrl = `data:image/png;base64,${imageData}`;
    console.log('🎨 图片生成成功 (Imagen 4.0), 大小:', Math.round(imageUrl.length / 1024) + 'KB');
    
    return {
      imageUrl,
      prompt: imagePrompt
    };
  }

  throw new Error('No image generated from Imagen 4.0 API');
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;
    const { prompt } = await request.json() as { prompt: CatPrompt };
    
    let currentPoints = 0;
    let isGuestMode = false;

    // 检测用户套餐
    const planResult = await detectUserPlan(userId);
    console.log('📊 套餐检测 (新版API):', planResult.plan, '-', planResult.reason);

    if (!userId) {
      // 访客模式不使用新版测试API，应该使用原有API
      isGuestMode = true;
      console.log('🎨 访客模式不支持新版测试API，请使用原有API');
      return NextResponse.json(
        { error: 'Guest users should use the original API endpoint, not the test version' },
        { status: 400 }
      );
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

    let imageUrl = '';
    let generatedPrompt = '';
    let apiUsed = '';

    // 注册用户根据套餐选择API
    if (planResult.shouldUseVertexAI) {
      console.log('🎨 Standard/Super用户使用 Vertex AI...');
      
      // 检查 Vertex AI 可用性
      const isVertexAIAvailable = await checkVertexAIAvailability();
      
      if (isVertexAIAvailable) {
        try {
          const vertexResult = await generateImageWithVertexAI(prompt);
          
          if (vertexResult.success && vertexResult.imageUrl) {
            imageUrl = vertexResult.imageUrl;
            generatedPrompt = 'Generated with Vertex AI Imagen 3.0';
            apiUsed = 'vertex-ai';
            console.log('✅ Vertex AI 生成成功');
          } else {
            throw new Error(vertexResult.error || 'Vertex AI generation failed');
          }
        } catch (error) {
          console.error('❌ Vertex AI 失败，使用新的Imagen 4.0 API:', error);
          // 回退到新的Imagen 4.0 API
          const imagen4Result = await generateImageWithImagen4(prompt);
          imageUrl = imagen4Result.imageUrl;
          generatedPrompt = imagen4Result.prompt;
          apiUsed = 'imagen-4.0-fallback';
        }
      } else {
        console.warn('⚠️ Vertex AI 不可用，使用新的Imagen 4.0 API');
        // 使用新的Imagen 4.0 API
        const imagen4Result = await generateImageWithImagen4(prompt);
        imageUrl = imagen4Result.imageUrl;
        generatedPrompt = imagen4Result.prompt;
        apiUsed = 'imagen-4.0';
      }
    } else {
      console.log('🎨 免费用户使用新的Imagen 4.0 API测试...');
      const imagen4Result = await generateImageWithImagen4(prompt);
      imageUrl = imagen4Result.imageUrl;
      generatedPrompt = imagen4Result.prompt;
      apiUsed = 'imagen-4.0-test';
    }

    if (!imageUrl) {
      throw new Error('No image generated from any API');
    }

    // 注册用户模式：扣减积分
    const { data: updatedPoints, error: deductError } = await supabase.rpc(
      'update_user_points',
      {
        p_user_id: userId,
        p_amount: 1,
        p_type: 'SPEND',
        p_reason: `Generated AI cat image using ${apiUsed} (test version)`
      }
    );

    if (deductError) {
      console.error('Error deducting points:', deductError);
    }

    console.log('👤 新版API图片生成完成, 剩余积分:', updatedPoints || (currentPoints - 1));
    return NextResponse.json({ 
      imageUrl,
      pointsRemaining: updatedPoints || (currentPoints - 1),
      isGuestMode: false,
      prompt: generatedPrompt,
      apiUsed,
      plan: planResult.plan,
      planFeatures: planResult.reason,
      testVersion: true // 标识这是测试版本
    });
  
  } catch (error) {
    console.error('Error generating cat image (test version):', error);
    return NextResponse.json(
      { error: 'Failed to generate cat image in test version' },
      { status: 500 }
    );
  }
} 