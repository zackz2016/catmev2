// 交易记录API

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import type { TransactionsResponse } from '@/types/transactions';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'payment' or 'points' or null for all
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    let response: TransactionsResponse = {
      success: true,
      data: {
        paymentTransactions: [],
        pointsTransactions: [],
        pagination: {
          limit,
          offset,
          hasMore: false
        }
      }
    };

    // 根据类型获取数据
    if (type === 'payment') {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      response.data!.paymentTransactions = data || [];
      response.data!.pagination.hasMore = (data || []).length === limit;

    } else if (type === 'points') {
      const { data, error } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      response.data!.pointsTransactions = data || [];
      response.data!.pagination.hasMore = (data || []).length === limit;

    } else { // 'all' or no type provided
      const { data: paymentTransactions, error: paymentError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (paymentError) throw paymentError;
      response.data!.paymentTransactions = paymentTransactions || [];

      const { data: pointsTransactions, error: pointsError } = await supabase
        .from('points_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (pointsError) throw pointsError;
      response.data!.pointsTransactions = pointsTransactions || [];
      
      const totalFetched = paymentTransactions.length + pointsTransactions.length;
      // Note: This hasMore logic is simplified and might not be perfectly accurate for combined queries.
      response.data!.pagination.hasMore = totalFetched > limit;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch transactions' 
    }, { status: 500 });
  }
} 