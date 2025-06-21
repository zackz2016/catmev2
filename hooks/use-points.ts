'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface PointsResponse {
  success: boolean;
  points?: number;
  error?: string;
}

export function usePoints() {
  const { isSignedIn } = useUser();
  const [points, setPoints] = useState<number>(1); // 默认1积分
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoints = async () => {
      try {
        const response = await fetch('/api/points');
        const data: PointsResponse = await response.json();
        
        if (data.success && typeof data.points === 'number') {
          setPoints(data.points);
        } else {
          setError(data.error || '获取积分失败');
        }
      } catch (err) {
        setError('获取积分失败');
      } finally {
        setLoading(false);
      }
    };

    if (isSignedIn) {
      fetchPoints();
    } else {
      setLoading(false);
    }
  }, [isSignedIn]); // 当登录状态改变时重新获取积分

  const updatePoints = async (amount: number, type: 'EARN' | 'SPEND', reason: string) => {
    try {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, type, reason }),
      });
      
      const data: PointsResponse = await response.json();
      
      if (data.success && typeof data.points === 'number') {
        setPoints(data.points);
        return true;
      } else {
        setError(data.error || '更新积分失败');
        return false;
      }
    } catch (err) {
      setError('更新积分失败');
      return false;
    }
  };

  // 消费积分的便捷方法
  const spendPoints = async (amount: number, reason: string) => {
    if (points < amount) {
      setError('积分不足');
      return false;
    }
    return await updatePoints(amount, 'SPEND', reason);
  };

  // 获得积分的便捷方法
  const earnPoints = async (amount: number, reason: string) => {
    return await updatePoints(amount, 'EARN', reason);
  };

  // 检查是否有足够积分
  const hasEnoughPoints = (requiredAmount: number) => {
    return points >= requiredAmount;
  };

  // 刷新积分
  const refreshPoints = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/points');
      const data: PointsResponse = await response.json();
      
      if (data.success && typeof data.points === 'number') {
        setPoints(data.points);
      } else {
        setError(data.error || '获取积分失败');
      }
    } catch (err) {
      setError('获取积分失败');
    } finally {
      setLoading(false);
    }
  };

  return {
    points,
    loading,
    error,
    updatePoints,
    spendPoints,
    earnPoints,
    hasEnoughPoints,
    refreshPoints,
  };
} 