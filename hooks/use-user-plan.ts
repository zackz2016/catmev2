// 用户套餐检测Hook - 检测用户当前套餐类型，决定使用哪个API
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { supabase } from '@/lib/supabase';

export type UserPlan = 'free' | 'standard' | 'super';

export interface PlanDetectionResult {
  plan: UserPlan;
  shouldUseVertexAI: boolean;
  shouldUseNewAPI: boolean; // 新增：是否使用新的测试API
  reason: string;
  loading: boolean;
}

export function useUserPlan(): PlanDetectionResult {
  const { isSignedIn, user } = useUser();
  const [planResult, setPlanResult] = useState<PlanDetectionResult>({
    plan: 'free',
    shouldUseVertexAI: false,
    shouldUseNewAPI: false,
    reason: 'Loading...',
    loading: true
  });

  const detectUserPlan = async () => {
    try {
      // 访客用户或未登录用户默认为免费套餐
      if (!isSignedIn || !user?.id) {
        setPlanResult({
          plan: 'free',
          shouldUseVertexAI: false,
          shouldUseNewAPI: false,
          reason: 'Guest user - using original proxy API',
          loading: false
        });
        return;
      }

      // 查询用户的付费记录来判断套餐
      const { data: transactions, error } = await supabase
        .from('payment_transactions')
        .select('plan_id, status, created_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('📊 查询用户交易记录失败:', error);
        // 发生错误时默认使用免费套餐
        setPlanResult({
          plan: 'free',
          shouldUseVertexAI: false,
          shouldUseNewAPI: false,
          reason: 'Database error - defaulting to free plan',
          loading: false
        });
        return;
      }

      // 如果没有付费记录，使用免费套餐
      if (!transactions || transactions.length === 0) {
        setPlanResult({
          plan: 'free',
          shouldUseVertexAI: false,
          shouldUseNewAPI: false,
          reason: 'No paid transactions found - using original proxy API',
          loading: false
        });
        return;
      }

      const latestTransaction = transactions[0];
      const planId = latestTransaction.plan_id;

      // 根据plan_id判断套餐类型
      switch (planId) {
        case 'standard':
          setPlanResult({
            plan: 'standard',
            shouldUseVertexAI: true,
            shouldUseNewAPI: true, // Standard用户使用新API测试
            reason: 'Standard plan detected - using new test API',
            loading: false
          });
          break;
        
        case 'super':
          setPlanResult({
            plan: 'super',
            shouldUseVertexAI: true,
            shouldUseNewAPI: true, // Super用户使用新API测试
            reason: 'Super plan detected - using new test API',
            loading: false
          });
          break;
        
        default:
          // 未知套餐类型，默认使用免费套餐
          setPlanResult({
            plan: 'free',
            shouldUseVertexAI: false,
            shouldUseNewAPI: false,
            reason: `Unknown plan_id: ${planId} - defaulting to original proxy API`,
            loading: false
          });
          break;
      }

    } catch (error) {
      console.error('📊 套餐检测失败:', error);
      // 发生异常时默认使用免费套餐
      setPlanResult({
        plan: 'free',
        shouldUseVertexAI: false,
        shouldUseNewAPI: false,
        reason: 'Exception occurred - defaulting to original proxy API',
        loading: false
      });
    }
  };

  useEffect(() => {
    detectUserPlan();
  }, [isSignedIn, user?.id]);

  return planResult;
} 