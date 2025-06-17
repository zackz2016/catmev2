import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Creem } from "creem";

// 初始化 Creem 客户端 - 使用测试模式
const creem = new Creem({
  serverURL: "https://test-api.creem.io"
});

export async function GET(request: Request) {
  try {
    console.log('开始处理支付验证请求');
    
    const session = await auth();
    const userId = session?.userId;
    console.log('当前用户ID:', userId);

    if (!userId) {
      console.error('未授权访问');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const checkoutId = searchParams.get('checkout_id');
    const orderId = searchParams.get('order_id');
    const status = searchParams.get('status');

    console.log('支付验证参数:', { checkoutId, orderId, status });

    if (!checkoutId || !orderId) {
      console.error('缺少必要的支付参数');
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要的支付参数' 
      }, { status: 400 });
    }

    console.log('开始验证支付会话:', checkoutId);
    
    // 验证支付会话
    const paymentSession = await creem.retrieveCheckout({
      checkoutId,
      xApiKey: process.env.CREEM_API_KEY!
    });

    console.log('支付会话信息:', paymentSession);

    // 验证支付会话是否属于当前用户
    if (paymentSession.metadata?.userId !== userId) {
      console.error('支付会话用户ID不匹配:', {
        sessionUserId: paymentSession.metadata?.userId,
        currentUserId: userId
      });
      return NextResponse.json({ 
        success: false, 
        error: '无效的支付会话' 
      });
    }

    // 检查支付状态
    if (paymentSession.status !== 'succeeded') {
      console.log('支付未完成，当前状态:', paymentSession.status);
      return NextResponse.json({ 
        success: false, 
        error: '支付未完成',
        status: paymentSession.status
      });
    }

    console.log('支付验证成功');

    // 支付成功，返回结果
    return NextResponse.json({ 
      success: true,
      payment: {
        checkoutId,
        orderId,
        status: paymentSession.status,
        amount: paymentSession.amount,
        currency: paymentSession.currency,
        planId: paymentSession.metadata?.planId
      }
    });

  } catch (error: any) {
    console.error('支付验证失败:', {
      error,
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({ 
      success: false, 
      error: `支付验证失败: ${error.message || '未知错误'}` 
    }, { status: 500 });
  }
} 