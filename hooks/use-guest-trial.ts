// 访客试用状态管理Hook - 管理未注册用户的免费体验次数
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getGuestTrialStatus, useGuestTrial as consumeGuestTrial, detectSuspiciousActivity } from '@/lib/guest-trial';

interface GuestTrialState {
  remaining: number;
  used: number;
  canUse: boolean;
  isLoading: boolean;
}

export function useGuestTrial() {
  const { isSignedIn } = useUser();
  const [trialState, setTrialState] = useState<GuestTrialState>({
    remaining: 3, // 改为3次试用，符合用户需求
    used: 0,
    canUse: true,
    isLoading: true
  });

  // 检查试用状态
  const checkTrialStatus = () => {
    if (isSignedIn) {
      setTrialState({
        remaining: 0,
        used: 0,
        canUse: false,
        isLoading: false
      });
      return;
    }

    const status = getGuestTrialStatus();
    // 临时禁用防滥用检测，专注解决核心问题
    // const suspicious = detectSuspiciousActivity();
    const suspicious = false;
    
    console.log('🐱 Hook checkTrialStatus:', { status, suspicious, canUse: status.remaining > 0 && !suspicious });
    
    setTrialState({
      remaining: status.remaining,
      used: status.used,
      canUse: status.remaining > 0 && !suspicious,
      isLoading: false
    });
  };

  // 使用试用次数
  const consumeTrial = (): boolean => {
    if (isSignedIn || !trialState.canUse) {
      return false;
    }

    const success = consumeGuestTrial();
    if (success) {
      checkTrialStatus(); // 更新状态
    }
    return success;
  };

  // 初始化和登录状态变化时检查
  useEffect(() => {
    checkTrialStatus();
  }, [isSignedIn]);

  return {
    ...trialState,
    consumeTrial,
    refreshStatus: checkTrialStatus
  };
} 