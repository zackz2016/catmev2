'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'pending';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('verifying');
  const [countdown, setCountdown] = useState(5);
  const [retryCount, setRetryCount] = useState(0);
  const [paymentData, setPaymentData] = useState<any>(null);

  const MAX_RETRIES = 6; // 最多重试6次（约30秒）
  const RETRY_INTERVAL = 5000; // 5秒重试间隔

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const checkoutId = searchParams.get('checkout_id');
        const orderId = searchParams.get('order_id');

        console.log('支付验证参数:', { checkoutId, orderId, retryCount });

        if (!checkoutId || !orderId) {
          console.error('缺少支付参数');
          setPaymentStatus('failed');
          toast({
            title: "支付验证失败",
            description: "缺少必要的支付参数",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch(
          `/api/payment/verify?checkout_id=${checkoutId}&order_id=${orderId}`,
          { method: 'GET' }
        );
        
        const data = await response.json();
        console.log('支付验证响应:', { status: response.status, data });

        if (data.success) {
          setPaymentStatus('success');
          setPaymentData(data.payment);
          
          // 如果支付记录还在pending状态，提示等待
          if (data.payment?.pending) {
            toast({
              title: "支付成功！",
              description: "正在处理您的订单，积分将很快到账",
            });
          } else {
            toast({
              title: "支付成功！",
              description: `积分已到账：+${data.payment?.pointsAdded || 0}`,
            });
          }
        } else if (data.status === 'pending' && retryCount < MAX_RETRIES) {
          // 支付还在处理中，继续重试
          console.log(`支付处理中，第${retryCount + 1}次重试...`);
          setPaymentStatus('pending');
          setRetryCount(prev => prev + 1);
          
          setTimeout(verifyPayment, RETRY_INTERVAL);
          return; // 不启动倒计时
        } else {
          // 支付失败或重试次数过多
          setPaymentStatus('failed');
          const errorMessage = retryCount >= MAX_RETRIES 
            ? '支付验证超时，请联系客服确认支付状态' 
            : data.error || '支付验证失败';
          
          console.error('支付验证失败:', errorMessage);
          toast({
            title: "支付验证失败",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('支付验证异常:', error);
        
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(verifyPayment, RETRY_INTERVAL);
          return;
        }
        
        setPaymentStatus('failed');
        toast({
          title: "支付验证失败",
          description: "网络错误，请稍后重试或联系客服",
          variant: "destructive",
        });
      }
    };

    verifyPayment();
  }, [searchParams, toast, retryCount]);

  // 倒计时逻辑
  useEffect(() => {
    if (paymentStatus === 'success' || paymentStatus === 'failed') {
      const timer = setInterval(() => {
        setCountdown(prev => prev <= 1 ? 0 : prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentStatus]);

  // 自动跳转逻辑
  useEffect(() => {
    if (countdown === 0 && (paymentStatus === 'success' || paymentStatus === 'failed')) {
      router.push(paymentStatus === 'success' ? '/' : '/pricing');
    }
  }, [countdown, paymentStatus, router]);

  const handleManualRedirect = () => {
    router.push(paymentStatus === 'success' ? '/' : '/pricing');
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'verifying':
      case 'pending':
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'failed':
        return <XCircle className="h-16 w-16 text-red-500" />;
      default:
        return <Clock className="h-16 w-16 text-gray-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus) {
      case 'verifying':
        return '正在验证支付状态...';
      case 'pending':
        return `支付处理中... (${retryCount}/${MAX_RETRIES})`;
      case 'success':
        return '支付成功！';
      case 'failed':
        return '支付验证失败';
      default:
        return '处理中...';
    }
  };

  const getStatusDescription = () => {
    switch (paymentStatus) {
      case 'verifying':
        return '正在确认您的支付信息，请稍候...';
      case 'pending':
        return '支付正在处理中，我们会持续检查支付状态...';
      case 'success':
        return paymentData?.pending 
          ? '支付已确认，积分正在处理中，稍后将自动到账'
          : `恭喜！您已成功购买 ${paymentData?.planId || ''} 套餐${paymentData?.pointsAdded ? `，获得 ${paymentData.pointsAdded} 积分` : ''}`;
      case 'failed':
        return '很抱歉，支付验证失败。如果您已完成支付，请联系客服处理。';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          <h1 className="text-2xl font-bold mb-4">{getStatusTitle()}</h1>
          <p className="text-gray-300 mb-6">{getStatusDescription()}</p>

          {(paymentStatus === 'success' || paymentStatus === 'failed') && (
            <div className="space-y-4">
              <div className="text-sm text-gray-400">
                {countdown > 0 ? (
                  `${countdown} 秒后自动跳转${paymentStatus === 'success' ? '回主页' : '到定价页面'}`
                ) : (
                  '正在跳转...'
                )}
              </div>
              
              <Button 
                onClick={handleManualRedirect}
                className={`w-full ${
                  paymentStatus === 'success'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {paymentStatus === 'success' ? '返回主页' : '重新选择套餐'}
              </Button>
            </div>
          )}

          {paymentStatus === 'pending' && (
            <div className="flex items-center justify-center text-yellow-500 mt-4">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span className="text-sm">请保持页面打开，正在验证支付状态...</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
        <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-6">
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-4">加载中...</h1>
            <p className="text-gray-300 mb-6">正在初始化支付验证...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
} 