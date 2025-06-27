// 访客试用管理系统 - 支持未注册用户免费体验，包含基础防滥用机制

interface GuestTrial {
  remaining: number;
  used: number;
  lastUsed?: string;
  fingerprint?: string;
}

// 获取客户端IP地址
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const userAgent = request.headers.get('user-agent') || '';
  
  // 使用IP + User-Agent的组合作为基础指纹
  const baseIP = forwarded?.split(',')[0] || realIP || 'unknown';
  return `${baseIP}-${userAgent.slice(0, 50)}`;
}

// 生成浏览器指纹
export function generateBrowserFingerprint(request: Request): string {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  // 简单的指纹生成
  const fingerprint = btoa(`${userAgent}-${acceptLanguage}-${acceptEncoding}`);
  return fingerprint.slice(0, 32); // 截取前32位
}

// 强制重置试用状态
export function forceResetGuestTrial(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  console.log('🔄 Force resetting guest trial...');
  localStorage.removeItem('catme_guest_trial');
  sessionStorage.removeItem('catme_session_used');
  localStorage.removeItem('catme_last_access');
  console.log('🔄 Force reset completed');
}

// 检查访客是否还有试用次数
export function getGuestTrialStatus(): GuestTrial {
  if (typeof window === 'undefined') {
    return { remaining: 3, used: 0 }; // 改为3次试用
  }

  try {
    const stored = localStorage.getItem('catme_guest_trial');
    if (!stored) {
      console.log('🐱 No trial data found, returning fresh status (3 trials)');
      return { remaining: 3, used: 0 }; // 改为3次试用
    }

    const trial: GuestTrial = JSON.parse(stored);
    console.log('🐱 Found trial data:', trial);
    
    // 检查是否是今天的记录（24小时重置）
    const lastUsed = trial.lastUsed ? new Date(trial.lastUsed) : new Date(0);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);
    
    console.log('🐱 Time check:', { lastUsed: trial.lastUsed, hoursDiff, shouldReset: hoursDiff >= 24 });
    
    if (hoursDiff >= 24) {
      // 重置试用次数
      console.log('🐱 Resetting trial due to 24h timeout');
      return { remaining: 3, used: 0 }; // 改为3次试用
    }
    
    console.log('🐱 Returning existing trial status:', trial);
    return trial;
  } catch (error) {
    console.error('Error reading guest trial status:', error);
    return { remaining: 3, used: 0 }; // 改为3次试用
  }
}

// 使用一次免费试用
export function useGuestTrial(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const current = getGuestTrialStatus();
    
    if (current.remaining <= 0) {
      return false;
    }

    const updated: GuestTrial = {
      remaining: current.remaining - 1,
      used: current.used + 1,
      lastUsed: new Date().toISOString(),
      fingerprint: window.navigator.userAgent.slice(0, 50)
    };

    localStorage.setItem('catme_guest_trial', JSON.stringify(updated));
    
    // 额外的session标记
    sessionStorage.setItem('catme_session_used', 'true');
    
    console.log('🐱 Trial consumed, new status:', updated);
    return true;
  } catch (error) {
    console.error('Error using guest trial:', error);
    return false;
  }
}

// 重置试用状态（用于测试）
export function resetGuestTrial(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  localStorage.removeItem('catme_guest_trial');
  sessionStorage.removeItem('catme_session_used');
}

// 检查是否是可疑的快速重复访问
export function detectSuspiciousActivity(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const lastAccess = localStorage.getItem('catme_last_access');
    const now = Date.now();
    
    if (lastAccess) {
      const timeDiff = now - parseInt(lastAccess);
      // 放宽限制：如果距离上次访问少于2秒，标记为可疑（避免误触发）
      if (timeDiff < 2000) {
        console.log('🚨 Detected suspicious activity: too fast access', { timeDiff });
        return true;
      }
    }
    
    localStorage.setItem('catme_last_access', now.toString());
    return false;
  } catch (error) {
    console.error('Error in detectSuspiciousActivity:', error);
    return false;
  }
} 