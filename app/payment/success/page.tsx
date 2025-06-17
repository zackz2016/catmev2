'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(true);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // 获取支付回调参数
    const checkoutId = searchParams.get('checkout_id');
    const orderId = searchParams.get('order_id');
    const status = searchParams.get('status');

    console.log('支付回调参数:', { checkoutId, orderId, status });

    // 保存支付参数
    setCheckoutId(checkoutId);
    setOrderId(orderId);

    // 如果没有支付参数，可能是直接访问页面
    if (!checkoutId || !orderId) {
      console.log('没有支付参数，可能是直接访问页面');
      setIsVerifying(false);
      return;
    }

    // 开始轮询支付状态
    const pollPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/verify?checkout_id=${checkoutId}&order_id=${orderId}`);
        const data = await response.json();

        console.log('支付验证响应:', data);

        if (data.success) {
          // 支付成功
          toast({
            title: "支付成功",
            description: "感谢您的订阅！",
          });

          // 延迟2秒后跳转到主页
          setTimeout(() => {
            router.push('/');
          }, 2000);
          return true;
        } else if (data.status === 'pending') {
          // 支付处理中，继续轮询
          return false;
        } else {
          // 支付失败
          throw new Error(data.error || '支付验证失败');
        }
      } catch (error: any) {
        console.error('支付验证失败:', error);
        toast({
          title: "支付验证失败",
          description: error.message || "请稍后重试",
          variant: "destructive",
        });
        
        // 延迟2秒后跳转到主页
        setTimeout(() => {
          router.push('/');
        }, 2000);
        return true;
      }
    };

    // 开始轮询
    const pollInterval = setInterval(async () => {
      const shouldStop = await pollPaymentStatus();
      if (shouldStop) {
        clearInterval(pollInterval);
        setIsVerifying(false);
      }
    }, 3000); // 每3秒检查一次

    // 清理函数
    return () => {
      clearInterval(pollInterval);
    };
  }, [router, searchParams, toast]);

  // 如果没有验证参数，显示等待页面
  if (!isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">支付处理中</h1>
          <p className="text-gray-400">请稍候，系统正在处理您的支付...</p>
          <p className="text-gray-400 mt-4">如果支付已完成，请刷新页面</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">正在处理支付结果...</h1>
        <p className="text-gray-400">请稍候，即将跳转到主页</p>
      </div>
    </div>
  );
} 