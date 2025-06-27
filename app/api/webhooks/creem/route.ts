// Creem webhook处理端点
// 处理Creem支付平台的webhook通知，包含签名验证和支付记录创建

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

// 计划对应的积分
const PLAN_POINTS = {
  'standard':100,
  'super': 300
} as const;

// 验证Creem webhook签名
function verifyCreemWebhookSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('签名验证失败:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const headersList = await headers();
    const signature = headersList.get('creem-signature');
    
    console.log('收到Creem webhook:', {
      hasSignature: !!signature,
      bodyLength: rawBody.length
    });

    // 验证签名
    if (!signature || !process.env.CREEM_WEBHOOK_SECRET) {
      console.error('缺少签名或webhook密钥');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isValidSignature = verifyCreemWebhookSignature(
      rawBody, 
      signature, 
      process.env.CREEM_WEBHOOK_SECRET
    );

    if (!isValidSignature) {
      console.error('Webhook签名验证失败');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const event = JSON.parse(rawBody);
    console.log('Webhook事件:', {
      eventType: event.eventType,
      checkoutId: event.object?.id,
      orderId: event.object?.order?.id
    });

    // 处理支付成功事件
    if (event.eventType === 'payment.succeeded' || event.eventType === 'checkout.completed') {
      // 从正确的数据结构中解构数据
      const checkout_id = event.object?.id;
      const order_id = event.object?.order?.id;
      const customer_id = event.object?.customer?.id;
      const product_id = event.object?.product?.id;
      const amount = event.object?.order?.amount;
      const currency = event.object?.order?.currency;
      const metadata = event.object?.metadata;

      if (!checkout_id || !order_id) {
        console.error('缺少必要的支付参数');
        return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 });
      }

      const userId = metadata?.userId;
      const planId = metadata?.planId;

      if (!userId || !planId) {
        console.error('缺少用户ID或计划ID');
        return NextResponse.json({ error: 'Missing user or plan ID' }, { status: 400 });
      }

      const pointsToAdd = PLAN_POINTS[planId as keyof typeof PLAN_POINTS] || 0;

      if (pointsToAdd > 0) {
        try {
          const rpcParams = {
            p_user_id: userId,
            p_checkout_id: checkout_id,
            p_order_id: order_id,
            p_plan_id: planId,
            p_amount: amount,
            p_currency: currency || 'USD',
            p_points: pointsToAdd
          };

          console.log('处理支付成功，参数:', rpcParams);
          const { data, error } = await supabase.rpc('process_payment_success', rpcParams);

          if (error) {
            console.error('处理支付记录失败:', error);
            return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
          }

          console.log('支付处理成功:', data);
          return NextResponse.json({ success: true, data });

        } catch (error) {
          console.error('支付处理异常:', error);
          return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
        }
      }
    }

    // 其他事件类型暂时忽略
    return NextResponse.json({ success: true, message: 'Event ignored' });

  } catch (error: any) {
    console.error('Webhook处理失败:', {
      error: error.message,
      stack: error.stack
    });
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
} 