import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const { email, fullName, avatarUrl } = await request.json();

    // 同步用户信息到数据库
    const { data, error } = await supabase.rpc('sync_user_profile', {
      p_clerk_user_id: userId,
      p_email: email,
      p_full_name: fullName,
      p_avatar_url: avatarUrl
    });

    if (error) {
      console.error('Error syncing user profile:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to sync user profile' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      profileId: data 
    });

  } catch (error) {
    console.error('Error in sync-user API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

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

    // 获取用户资料
    const { data, error } = await supabase.rpc('get_user_profile', {
      p_clerk_user_id: userId
    });

    if (error) {
      console.error('Error getting user profile:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to get user profile' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      profile: data?.[0] || null 
    });

  } catch (error) {
    console.error('Error in sync-user API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 