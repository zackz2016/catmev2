// 测试图片生成API - 简化版本用于调试
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    console.log('🧪 Test API called');
    
    const session = await auth();
    const userId = session?.userId;
    const { prompt } = await request.json();
    
    console.log('🧪 Test API: userId:', userId);
    console.log('🧪 Test API: prompt:', prompt);
    
    // 检查环境变量
    const proxyUrl = process.env.GEMINI_PROXY_URL;
    console.log('🧪 Test API: GEMINI_PROXY_URL:', proxyUrl);
    
    if (!proxyUrl) {
      return NextResponse.json(
        { error: 'GEMINI_PROXY_URL not configured' },
        { status: 500 }
      );
    }
    
    // 返回成功测试响应
    return NextResponse.json({
      success: true,
      message: 'Test API working',
      userId: userId || 'guest',
      prompt: prompt,
      proxyConfigured: !!proxyUrl,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('🧪 Test API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Test API failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 