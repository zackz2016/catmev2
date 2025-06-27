// 支付验证API端点
// 处理用户从Creem支付页面返回时的支付状态验证
// 主要用于前端页面状态确认，实际支付处理由webhook完成

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Creem } from "creem";
import { supabase } from '@/lib/supabase';

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

    console.log('支付验证参数:', { checkoutId, orderId });

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

    // 检查数据库中是否已有支付记录（由webhook创建）
    const { data: existingPayment, error: dbError } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('checkout_id', checkoutId)
      .eq('user_id', userId)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('数据库查询错误:', dbError);
      return NextResponse.json({ 
        success: false, 
        error: '数据库查询失败' 
      }, { status: 500 });
    }

    if (existingPayment) {
      console.log('支付记录已存在，支付成功');
      return NextResponse.json({ 
        success: true,
        payment: {
          checkoutId: existingPayment.checkout_id,
          orderId: existingPayment.order_id,
          status: 'completed',
          amount: existingPayment.amount,
          currency: existingPayment.currency,
          planId: existingPayment.plan_id,
          pointsAdded: existingPayment.points_awarded
        }
      });
    }

    // 如果数据库中没有记录，检查Creem状态
    console.log('检查Creem支付状态:', checkoutId);
    
    try {
      const paymentSession = await creem.retrieveCheckout({
        checkoutId,
        xApiKey: process.env.CREEM_API_KEY
      });

      console.log('支付会话状态:', paymentSession.status);

      // 验证用户权限
      if (paymentSession.metadata?.userId !== userId) {
        console.error('支付会话用户ID不匹配');
        return NextResponse.json({ 
          success: false, 
          error: '无效的支付会话' 
        }, { status: 403 });
      }

      if (paymentSession.status === 'succeeded' || paymentSession.status === 'completed') {
        // 支付成功但webhook可能还未处理，返回成功状态
        return NextResponse.json({ 
          success: true,
          payment: {
            checkoutId,
            orderId,
            status: paymentSession.status,
            amount: paymentSession.order?.amount,
            currency: paymentSession.order?.currency,
            planId: paymentSession.metadata?.planId,
            pending: true // 标识为pending，等待webhook处理
          }
        });
      } else if (paymentSession.status === 'pending' || paymentSession.status === 'processing') {
        // 支付处理中
        return NextResponse.json({ 
          success: false,
          status: 'pending',
          message: '支付处理中，请稍候...'
        });
      } else {
        // 支付失败
        return NextResponse.json({ 
          success: false, 
          error: '支付失败',
          status: paymentSession.status
        });
      }

    } catch (error: any) {
      console.error('Creem API调用失败:', error);
      return NextResponse.json({ 
        success: false, 
        error: '支付状态查询失败' 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('支付验证失败:', {
      error: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({ 
      success: false, 
      error: `服务器错误: ${error.message || '未知错误'}` 
    }, { status: 500 });
  }
} 