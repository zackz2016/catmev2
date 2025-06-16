'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

function PaymentVerification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      setError('无效的支付会话');
      setIsVerifying(false);
      return;
    }

    // 验证支付会话
    fetch(`/api/payment/verify?session_id=${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.success) {
          throw new Error(data.error || '支付验证失败');
        }
        setIsVerifying(false);
      })
      .catch(err => {
        console.error('Payment verification error:', err);
        setError('支付验证失败，请联系客服');
        setIsVerifying(false);
      });
  }, [searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">正在验证支付结果...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">支付验证失败</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button
              onClick={() => router.push('/pricing')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              返回定价页面
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">支付成功</h2>
          <p className="text-gray-400 mb-6">
            您的积分已经充值成功，现在可以开始生成更多精彩的猫咪图片了！
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/')}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              开始创作
            </Button>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              查看仪表盘
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// 主页面组件
export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-purple-500 border-purple-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    }>
      <PaymentVerification />
    </Suspense>
  );
} 