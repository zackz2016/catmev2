// 套餐检测器模块
// 根据用户状态判断应该使用哪个图片生成API

import { supabase } from '@/lib/supabase';

export type UserPlan = 'free' | 'standard' | 'super';

export interface PlanDetectionResult {
  plan: UserPlan;
  shouldUseVertexAI: boolean;
  reason: string;
}

/**
 * 检测用户套餐类型
 * @param userId - 用户ID，如果为null则为访客用户
 * @returns Promise<PlanDetectionResult>
 */
export async function detectUserPlan(userId: string | null): Promise<PlanDetectionResult> {
  try {
    // 访客用户或未登录用户默认为免费套餐
    if (!userId) {
      return {
        plan: 'free',
        shouldUseVertexAI: false,
        reason: 'Guest user - using proxy API'
      };
    }

    // 查询用户的付费记录来判断套餐
    const { data: transactions, error } = await supabase
      .from('payment_transactions')
      .select('plan_id, status, created_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('📊 查询用户交易记录失败:', error);
      // 发生错误时默认使用免费套餐
      return {
        plan: 'free',
        shouldUseVertexAI: false,
        reason: 'Database error - defaulting to free plan'
      };
    }

    // 如果没有付费记录，使用免费套餐
    if (!transactions || transactions.length === 0) {
      return {
        plan: 'free',
        shouldUseVertexAI: false,
        reason: 'No paid transactions found - using proxy API'
      };
    }

    const latestTransaction = transactions[0];
    const planId = latestTransaction.plan_id;

    // 根据plan_id判断套餐类型
    switch (planId) {
      case 'standard':
        return {
          plan: 'standard',
          shouldUseVertexAI: true,
          reason: 'Standard plan detected - using Vertex AI'
        };
      
      case 'super':
        return {
          plan: 'super',
          shouldUseVertexAI: true,
          reason: 'Super plan detected - using Vertex AI'
        };
      
      default:
        // 未知套餐类型，默认使用免费套餐
        return {
          plan: 'free',
          shouldUseVertexAI: false,
          reason: `Unknown plan_id: ${planId} - defaulting to proxy API`
        };
    }

  } catch (error) {
    console.error('📊 套餐检测失败:', error);
    // 发生异常时默认使用免费套餐
    return {
      plan: 'free',
      shouldUseVertexAI: false,
      reason: 'Exception occurred - defaulting to proxy API'
    };
  }
}

/**
 * 简化版套餐检测，仅返回是否应该使用Vertex AI
 * @param userId - 用户ID，如果为null则为访客用户
 * @returns Promise<boolean>
 */
export async function shouldUseVertexAI(userId: string | null): Promise<boolean> {
  const result = await detectUserPlan(userId);
  return result.shouldUseVertexAI;
}

/**
 * 获取套餐的特性描述
 * @param plan - 套餐类型
 * @returns 套餐特性描述
 */
export function getPlanFeatures(plan: UserPlan): string[] {
  switch (plan) {
    case 'free':
      return [
        '使用Gemini反向代理API',
        '基础图片质量',
        '标准响应速度'
      ];
    
    case 'standard':
      return [
        '使用Vertex AI Imagen 3.0官方API',
        '高质量图片生成',
        '提示词增强功能',
        '更好的细节表现'
      ];
    
    case 'super':
      return [
        '使用Vertex AI Imagen 3.0官方API',
        '最高质量图片生成',
        '提示词增强功能',
        '优先处理队列',
        '最佳细节表现和色彩还原'
      ];
    
    default:
      return ['未知套餐'];
  }
} 