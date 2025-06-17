import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { Creem } from "creem";

// 初始化 Creem 客户端 - 使用测试模式
const creem = new Creem({
  serverURL: "https://test-api.creem.io"
});

// 产品配置
const PRODUCT_CONFIGS = {
  lite: {
    productId: 'prod_4UNkxZPc3FmFtJNuwlsGrf',
    name: 'Catme-lite',
    description: '基础版套餐',
    price: 990 // 9.9 USD
  },
  pro: {
    productId: 'prod_6V0v4XYAsIOchRYysXCGFj',
    name: 'Catme-pro',
    description: '专业版套餐',
    price: 1990 // 19.9 USD
  },
  super: {
    productId: 'prod_5IdqdarRl3jrwF8WcyeH6J',
    name: 'Catme-super',
    description: '超级版套餐',
    price: 4990 // 49.9 USD
  }
};

export async function POST(request: Request) {
  try {
    console.log('开始处理支付请求');
    
    // 检查环境变量
    if (!process.env.CREEM_API_KEY) {
      console.error('缺少 CREEM_API_KEY 环境变量');
      return NextResponse.json({ 
        success: false, 
        error: '服务器配置错误：缺少 API 密钥' 
      }, { status: 500 });
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      console.error('缺少 NEXT_PUBLIC_APP_URL 环境变量');
      return NextResponse.json({ 
        success: false, 
        error: '服务器配置错误：缺少应用 URL' 
      }, { status: 500 });
    }
    
    const session = await auth();
    const userId = session?.userId;
    console.log('用户ID:', userId);

    if (!userId) {
      console.log('用户未授权');
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const body = await request.json();
    console.log('请求体:', body);
    
    const { planId } = body;
    const productConfig = PRODUCT_CONFIGS[planId as keyof typeof PRODUCT_CONFIGS];

    if (!productConfig) {
      console.log('无效的套餐方案:', planId);
      return NextResponse.json({ 
        success: false, 
        error: '无效的套餐方案' 
      }, { status: 400 });
    }

    const checkoutRequest = {
      productId: productConfig.productId,
      amount: productConfig.price,
      currency: 'USD',
      metadata: {
        userId,
        planId,
        productName: productConfig.name
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      request_id: `${userId}_${Date.now()}`,
      description: `${productConfig.name} - ${productConfig.description}`
    };

    console.log('创建支付会话，配置:', checkoutRequest);

    // 创建支付会话
    try {
      const result = await creem.createCheckout({
        xApiKey: process.env.CREEM_API_KEY,
        createCheckoutRequest: checkoutRequest
      });

      console.log('支付会话创建成功:', result);

      if (!result.checkoutUrl) {
        throw new Error('支付会话创建成功但未返回支付URL');
      }

      return NextResponse.json({ 
        success: true, 
        url: result.checkoutUrl 
      });
    } catch (apiError: any) {
      console.error('Creem API 调用失败:', {
        error: apiError,
        message: apiError.message,
        response: apiError.response?.data
      });
      
      return NextResponse.json({ 
        success: false, 
        error: `支付服务错误: ${apiError.message || '未知错误'}` 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('创建支付会话失败:', {
      error,
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({ 
      success: false, 
      error: `服务器错误: ${error.message || '未知错误'}` 
    }, { status: 500 });
  }
} 