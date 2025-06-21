import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Creem } from "creem";
import { verifyCreemSignature, type CreemRedirectParams } from '@/lib/creem-utils';
import { supabase } from '@/lib/supabase';

// 初始化 Creem 客户端 - 使用测试模式
const creem = new Creem({
  serverURL: "https://test-api.creem.io"
});

// 计划对应的积分
const PLAN_POINTS = {
  'lite': 50,
  'pro': 150,
  'super': 500
} as const;

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
    const requestId = searchParams.get('request_id');
    const customerId = searchParams.get('customer_id');
    const subscriptionId = searchParams.get('subscription_id');
    const productId = searchParams.get('product_id');
    const signature = searchParams.get('signature');

    console.log('支付验证参数:', { 
      checkoutId, 
      orderId, 
      status, 
      requestId, 
      customerId, 
      subscriptionId, 
      productId, 
      signature 
    });

    // 验证 Creem 签名（如果提供）
    if (signature) {
      const creemParams: CreemRedirectParams = {
        checkout_id: checkoutId,
        order_id: orderId,
        customer_id: customerId,
        subscription_id: subscriptionId,
        product_id: productId,
        request_id: requestId,
      };

      try {
        const isSignatureValid = verifyCreemSignature(creemParams, signature, process.env.CREEM_API_KEY!);
        if (!isSignatureValid) {
          console.error('Creem 签名验证失败');
          return NextResponse.json({ 
            success: false, 
            error: 'Invalid signature - 签名验证失败' 
          }, { status: 403 });
        }
        console.log('Creem 签名验证成功');
      } catch (error) {
        console.error('签名验证过程出错:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Signature verification error - 签名验证出错' 
        }, { status: 500 });
      }
    } else {
      console.log('未提供签名，跳过签名验证');
    }

    if (!checkoutId || !orderId) {
      console.error('缺少必要的支付参数');
      return NextResponse.json({ 
        success: false, 
        error: '缺少必要的支付参数' 
      }, { status: 400 });
    }

    if (!process.env.CREEM_API_KEY) {
      console.error('缺少 CREEM_API_KEY 环境变量');
      return NextResponse.json({ 
        success: false, 
        error: '服务器配置错误：缺少 API 密钥' 
      }, { status: 500 });
    }

    console.log('开始验证支付会话:', checkoutId);
    
    // 验证支付会话
    const paymentSession = await creem.retrieveCheckout({
      checkoutId,
      xApiKey: process.env.CREEM_API_KEY
    });

    console.log('支付会话信息:', {
      status: paymentSession.status,
      metadata: paymentSession.metadata,
      request_id: paymentSession.request_id,
      order: paymentSession.order
    });

    // 验证支付会话是否属于当前用户
    if (paymentSession.metadata?.userId !== userId) {
      console.error('支付会话用户ID不匹配:', {
        sessionUserId: paymentSession.metadata?.userId,
        currentUserId: userId
      });
      return NextResponse.json({ 
        success: false, 
        error: '无效的支付会话' 
      }, { status: 403 });
    }

    // 验证 request_id 是否匹配（如果双方都有值的话）
    // 先尝试使用主要的request_id，如果没有则尝试使用metadata中的备份
    const sessionRequestId = paymentSession.request_id || paymentSession.metadata?.requestId;
    if (requestId && requestId !== 'null' && sessionRequestId && sessionRequestId !== requestId) {
      console.error('支付会话 request_id 不匹配:', {
        sessionRequestId,
        metadataRequestId: paymentSession.metadata?.requestId,
        currentRequestId: requestId
      });
      return NextResponse.json({ 
        success: false, 
        error: '无效的支付会话' 
      }, { status: 403 });
    }

    // 检查支付状态
    if (paymentSession.status === 'succeeded' || paymentSession.status === 'completed') {
      console.log('支付验证成功，状态:', paymentSession.status);
      
      // 获取计划信息
      const planId = paymentSession.metadata?.planId;
      const pointsToAdd = planId ? PLAN_POINTS[planId as keyof typeof PLAN_POINTS] : 0;
      
      if (pointsToAdd > 0) {
        const amount = paymentSession.order?.amount;
        const currency = paymentSession.order?.currency;

        if (amount === undefined || currency === undefined) {
          console.error('支付会话缺少金额或货币信息', paymentSession);
        } else {
        try {
          // 创建交易记录并更新积分
            const rpcParams = {
            p_user_id: userId,
            p_checkout_id: checkoutId,
            p_order_id: orderId,
            p_plan_id: planId,
              p_amount: amount,
              p_currency: currency,
            p_points: pointsToAdd
            };
            console.log('调用 process_payment_success，参数:', rpcParams);
            const { data, error } = await supabase.rpc('process_payment_success', rpcParams);

          if (error) {
            console.error('处理支付成功失败:', error);
            // 即使积分处理失败，也返回支付成功
          } else {
            console.log('积分已更新:', pointsToAdd);
          }
        } catch (error) {
          console.error('积分处理异常:', error);
          }
        }
      }
      
      // 支付成功，返回结果
      return NextResponse.json({ 
        success: true,
        payment: {
          checkoutId,
          orderId,
          status: paymentSession.status,
          amount: paymentSession.order?.amount,
          currency: paymentSession.order?.currency,
          planId: paymentSession.metadata?.planId,
          requestId: paymentSession.request_id,
          pointsAdded: pointsToAdd
        }
      });
    } else if (paymentSession.status === 'pending' || paymentSession.status === 'processing') {
      console.log('支付处理中，当前状态:', paymentSession.status);
      return NextResponse.json({ 
        success: false, 
        status: 'pending',
        error: '支付处理中，请稍候...'
      });
    } else if (paymentSession.status === 'cancelled') {
      console.log('支付已取消');
      return NextResponse.json({ 
        success: false, 
        status: 'cancelled',
        error: '支付已取消'
      });
    } else if (paymentSession.status === 'failed') {
      console.log('支付失败');
      return NextResponse.json({ 
        success: false, 
        status: 'failed',
        error: '支付失败'
      });
    } else {
      console.log('支付状态未知:', paymentSession.status);
      return NextResponse.json({ 
        success: false, 
        status: paymentSession.status,
        error: `支付状态异常: ${paymentSession.status}`
      });
    }

  } catch (error: any) {
    console.error('支付验证失败:', {
      error,
      message: error.message,
      stack: error.stack
    });
    
    // 检查是否是网络错误或API错误
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return NextResponse.json({ 
        success: false, 
        error: '网络连接失败，请检查网络连接' 
      }, { status: 503 });
    }
    
    if (error.response && error.response.status === 404) {
      return NextResponse.json({ 
        success: false, 
        error: '支付会话不存在或已过期' 
      }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: `支付验证失败: ${error.message || '未知错误'}` 
    }, { status: 500 });
  }
} 