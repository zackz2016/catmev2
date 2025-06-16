'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import type { PointsResponse } from '@/types/points';

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

    fetchPoints();
  }, [isSignedIn]); // 当登录状态改变时重新获取积分

  const updatePoints = async (amount: number, type: 'add' | 'subtract', reason: string) => {
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

  return {
    points,
    loading,
    error,
    updatePoints,
  };
} 