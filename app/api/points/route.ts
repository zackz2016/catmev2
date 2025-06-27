import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { PointsResponse } from '@/types/points';
import { supabase } from '@/lib/supabase';

// 获取用户积分
export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    // 未登录用户无法访问
    if (!userId) {
      return NextResponse.json<PointsResponse>({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    // 查询用户积分
    const { data: points, error } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', userId)
      .single();

    if (error) {
      // 如果没有记录，创建新记录
      if (error.code === 'PGRST116') {
        const { data: newPoints, error: createError } = await supabase
          .from('user_points')
          .insert([
            { user_id: userId, points: 3 } // 新注册用户获得3积分
          ])
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        return NextResponse.json<PointsResponse>({ 
          success: true, 
          points: newPoints.points 
        });
      }
      throw error;
    }

    return NextResponse.json<PointsResponse>({ 
      success: true, 
      points: points.points 
    });

  } catch (error) {
    console.error('Error fetching points:', error);
    return NextResponse.json<PointsResponse>({ 
      success: false, 
      error: 'Failed to fetch points' 
    });
  }
}

// 更新用户积分
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json<PointsResponse>({ 
        success: false, 
        error: 'Unauthorized' 
      });
    }

    const { amount, type, reason } = await request.json();
    
    // 开始数据库事务
    const { data: points, error: pointsError } = await supabase.rpc(
      'update_user_points',
      {
        p_user_id: userId,
        p_amount: amount,
        p_type: type,
        p_reason: reason
      }
    );

    if (pointsError) {
      throw pointsError;
    }

    return NextResponse.json<PointsResponse>({ 
      success: true, 
      points 
    });

  } catch (error) {
    console.error('Error updating points:', error);
    return NextResponse.json<PointsResponse>({ 
      success: false, 
      error: 'Failed to update points' 
    });
  }
} 