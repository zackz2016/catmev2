import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@creem/sdk';

// 初始化 Creem 客户端
const creem = createClient({
  apiKey: process.env.CREEM_API_KEY!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing session ID' 
      }, { status: 400 });
    }

    // 验证支付会话
    const paymentSession = await creem.payments.retrieve(sessionId);

    if (paymentSession.status !== 'succeeded') {
      return NextResponse.json({ 
        success: false, 
        error: '支付未完成' 
      });
    }

    if (paymentSession.metadata?.userId !== userId) {
      return NextResponse.json({ 
        success: false, 
        error: '无效的支付会话' 
      });
    }

    // 支付成功，返回结果
    return NextResponse.json({ 
      success: true,
      payment: {
        amount: paymentSession.amount,
        currency: paymentSession.currency,
        status: paymentSession.status,
      }
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ 
      success: false, 
      error: '支付验证失败' 
    }, { status: 500 });
  }
} 