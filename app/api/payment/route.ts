import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@creem/sdk';

// 初始化 Creem 客户端
const creem = createClient({
  apiKey: process.env.CREEM_API_KEY!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
});

// 创建支付会话
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    const { priceId } = body;

    // 创建支付会话
    const paymentSession = await creem.payments.create({
      priceId,
      customerId: userId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ 
      success: true, 
      sessionId: paymentSession.id,
      url: paymentSession.url,
    });

  } catch (error) {
    console.error('Error creating payment session:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create payment session' 
    }, { status: 500 });
  }
}

// 处理 webhook
export async function PUT(request: Request) {
  try {
    const signature = request.headers.get('creem-signature');
    if (!signature) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing signature' 
      }, { status: 400 });
    }

    const body = await request.text();
    const event = creem.webhooks.constructEvent(
      body,
      signature,
      process.env.CREEM_WEBHOOK_SECRET!
    );

    // 处理不同类型的事件
    switch (event.type) {
      case 'payment.succeeded':
        // 支付成功，更新用户积分
        const { userId, points } = event.data;
        // TODO: 调用积分更新 API
        break;

      case 'subscription.created':
        // 订阅创建
        break;

      case 'subscription.updated':
        // 订阅更新
        break;

      case 'subscription.cancelled':
        // 订阅取消
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Webhook error' 
    }, { status: 400 });
  }
} 