"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { useRouter } from "next/navigation"

const PRICE_PLANS = [
  {
    id: 'starter',
    priceId: 'price_starter',
    title: '入门级',
    description: '适合个人用户和轻度使用',
    price: '29',
    points: 100,
    features: [
      { text: '100积分/月', included: true },
      { text: '基础风格模板', included: true },
      { text: '标准分辨率', included: true },
      { text: '商业使用权', included: false },
    ],
  },
  {
    id: 'pro',
    priceId: 'price_pro',
    title: '专业级',
    description: '适合专业创作者和小团队',
    price: '99',
    points: 500,
    popular: true,
    features: [
      { text: '500积分/月', included: true },
      { text: '所有风格模板', included: true },
      { text: 'HD分辨率', included: true },
      { text: '商业使用权', included: true },
      { text: '优先处理', included: true },
    ],
  },
  {
    id: 'enterprise',
    priceId: 'price_enterprise',
    title: '企业级',
    description: '适合大型团队和企业用户',
    price: '299',
    points: -1, // 无限制
    features: [
      { text: '无限积分生成', included: true },
      { text: '自定义风格模板', included: true },
      { text: '超高清分辨率', included: true },
      { text: '扩展商业权限', included: true },
      { text: '专属客服支持', included: true },
      { text: 'API访问', included: true },
    ],
  },
];

export function Pricing() {
  const { isSignedIn } = useUser();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!isSignedIn) {
      toast({
        title: "请先登录",
        description: "订阅服务需要先登录账号",
      });
      return;
    }

    try {
      setIsLoading(priceId);
      const response = await fetch('/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '创建支付会话失败');
      }

      // 跳转到支付页面
      window.location.href = data.url;

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "支付失败",
        description: "创建支付会话时出错，请稍后重试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">选择最适合你的方案</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            灵活的定价选项，满足不同用户的需求
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICE_PLANS.map((plan) => (
            <Card 
              key={plan.id}
              className={`bg-gray-800/50 border-gray-700 relative ${
                plan.popular ? 'bg-gradient-to-b from-purple-500/10 to-pink-500/10 border-purple-500/50' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">最受欢迎</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-white text-xl">{plan.title}</CardTitle>
                <CardDescription className="text-gray-400">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">¥{plan.price}</span>
                  <span className="text-gray-400">/月</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-400 mr-3" />
                      ) : (
                        <X className="w-5 h-5 text-gray-500 mr-3" />
                      )}
                      <span className={feature.included ? "text-gray-300" : "text-gray-500"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full mt-6 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={!!isLoading}
                >
                  {isLoading === plan.priceId ? '处理中...' : (plan.id === 'enterprise' ? '联系销售' : '立即订阅')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
} 