'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { extractCreemParams, verifyCreemSignature } from '@/lib/creem-utils';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'pending';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('verifying');
  const [countdown, setCountdown] = useState(5);
  const [retryCount, setRetryCount] = useState(0);
  const [signatureValid, setSignatureValid] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // 获取支付回调参数
        const { params: creemParams, signature } = extractCreemParams(searchParams);
        const checkoutId = creemParams.checkout_id || searchParams.get('session_id');
        const orderId = creemParams.order_id;
        const status = searchParams.get('status');
        const requestId = creemParams.request_id;

        console.log('支付回调参数:', { 
          checkoutId, 
          orderId, 
          status, 
          requestId,
          creemParams,
          signature,
          allParams: Object.fromEntries(searchParams.entries())
        });

        // 验证 Creem 签名（如果存在）
        if (signature && process.env.NEXT_PUBLIC_CREEM_API_KEY) {
          try {
            const isSignatureValid = verifyCreemSignature(
              creemParams, 
              signature, 
              process.env.NEXT_PUBLIC_CREEM_API_KEY
            );
            setSignatureValid(isSignatureValid);
            console.log('Creem 签名验证结果:', isSignatureValid);
            
            if (!isSignatureValid) {
              console.warn('Creem 签名验证失败，但继续处理支付验证');
              toast({
                title: "安全警告",
                description: "签名验证失败，但仍会验证支付状态",
                variant: "default",
              });
            }
          } catch (error) {
            console.error('签名验证过程出错:', error);
            setSignatureValid(false);
          }
        } else {
          console.log('未提供签名或 API Key，跳过签名验证');
        }

        // 如果没有支付参数，可能是直接访问页面
        if (!checkoutId || !orderId) {
          console.error('缺少支付参数:', { checkoutId, orderId });
          setPaymentStatus('failed');
          toast({
            title: "支付验证失败",
            description: "缺少必要的支付参数",
            variant: "destructive",
          });
          return;
        }

        // 验证支付状态
        const response = await fetch(`/api/payment/verify?checkout_id=${checkoutId}&order_id=${orderId}&status=${status}&request_id=${requestId}`);
        const data = await response.json();

        console.log('支付验证响应:', {
          status: response.status,
          data,
          headers: response.headers
        });

        // 检查HTTP状态码
        if (!response.ok) {
          console.error('支付验证HTTP错误:', response.status, data);
          if (response.status === 403) {
            setPaymentStatus('failed');
            toast({
              title: "支付验证失败",
              description: "支付会话验证失败，可能是安全验证问题",
              variant: "destructive",
            });
            return;
          }
        }

        if (data.success) {
          // 支付成功
          setPaymentStatus('success');
          toast({
            title: "支付成功！",
            description: "感谢您的订阅，正在为您跳转...",
          });
        } else if (data.status === 'pending' && retryCount < 5) {
          // 支付处理中，继续等待（最多重试5次）
          console.log(`支付处理中，第${retryCount + 1}次重试...`);
          setPaymentStatus('pending');
          setRetryCount(prev => prev + 1);
          toast({
            title: "支付处理中",
            description: `正在确认您的支付状态，请稍候...（${retryCount + 1}/5）`,
          });
          setTimeout(verifyPayment, 3000); // 3秒后重试
          return; // 不启动倒计时
        } else {
          // 支付失败或重试次数过多
          setPaymentStatus('failed');
          const errorMessage = data.error || (retryCount >= 5 ? '支付验证超时，请联系客服' : '支付验证失败');
          console.error('支付验证失败:', errorMessage, 'data:', data);
          toast({
            title: "支付验证失败",
            description: errorMessage,
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error('支付验证失败:', error);
        setPaymentStatus('failed');
        toast({
          title: "支付验证失败",
          description: error.message || "网络错误，请稍后重试",
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
        setCountdown(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentStatus]);

  // 自动跳转逻辑 - 当倒计时结束时跳转
  useEffect(() => {
    if (countdown === 0 && (paymentStatus === 'success' || paymentStatus === 'failed')) {
      if (paymentStatus === 'success') {
        router.push('/');
      } else {
        router.push('/pricing');
      }
    }
  }, [countdown, paymentStatus, router]);

  const handleManualRedirect = () => {
    if (paymentStatus === 'success') {
      router.push('/');
    } else {
      router.push('/pricing');
    }
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
        return '支付处理中...';
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
        return '请稍候，我们正在确认您的支付状态';
      case 'pending':
        return `正在处理您的支付，请耐心等待（${retryCount + 1}/5）`;
      case 'success':
        return `感谢您的订阅！${countdown}秒后自动跳转到主页`;
      case 'failed':
        return `很抱歉，支付验证失败。${countdown}秒后自动跳转到定价页面`;
      default:
        return '请稍候...';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            {getStatusTitle()}
          </h1>
          
          <p className="text-gray-400 mb-6">
            {getStatusDescription()}
          </p>

          {/* 签名验证状态指示器 */}
          {signatureValid !== null && (
            <div className={`flex items-center justify-center space-x-2 text-sm mb-4 ${
              signatureValid ? 'text-green-400' : 'text-yellow-400'
            }`}>
              {signatureValid ? (
                <Shield className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span>
                {signatureValid ? '安全验证通过' : '签名验证警告'}
              </span>
            </div>
          )}

          {(paymentStatus === 'success' || paymentStatus === 'failed') && (
            <div className="space-y-4">
              <div className="flex justify-center items-center space-x-2 text-sm text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{countdown}秒后自动跳转</span>
              </div>
              
              <Button 
                onClick={handleManualRedirect}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                立即跳转
              </Button>
            </div>
          )}

          {paymentStatus === 'pending' && (
            <div className="text-sm text-yellow-400">
              支付正在处理中，请不要关闭此页面
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 