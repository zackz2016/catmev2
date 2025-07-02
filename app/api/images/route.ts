import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const url = new URL(request.url);
    const isAuthenticated = !!session?.userId;
    
    // 获取查询参数
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const userId = url.searchParams.get('userId'); // 可选：获取特定用户的图片
    const onlyPublic = url.searchParams.get('public') === 'true'; // 只获取公开图片
    
    // 计算偏移量
    const offset = (page - 1) * limit;
    
    // 构建查询，包含更多字段
    let query = supabase
      .from('generated_images')
      .select(`
        id,
        user_id,
        cloudinary_public_id,
        cloudinary_url,
        prompt,
        image_style,
        download_count,
        is_public,
        width,
        height,
        file_size,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    // 如果指定了用户ID，只获取该用户的图片
    if (userId) {
      query = query.eq('user_id', userId);
      // 如果查看特定用户图片且非本人，需要验证权限
      if (!isAuthenticated || session.userId !== userId) {
        query = query.eq('is_public', true); // 只能看到公开图片
      }
    } else if (onlyPublic || !isAuthenticated) {
      // 未登录用户或明确要求公开图片时，只显示公开图片
      query = query.eq('is_public', true);
    }
    
    const { data: images, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch images' },
        { status: 500 }
      );
    }
    
    // 获取总数用于分页
    let countQuery = supabase
      .from('generated_images')
      .select('*', { count: 'exact', head: true });
    
    if (userId) {
      countQuery = countQuery.eq('user_id', userId);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Count error:', countError);
    }
    
    const total = count || 0;
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;
    
    return NextResponse.json({
      success: true,
      images: images?.map(image => ({
        id: image.id,
        userId: image.user_id,
        publicId: image.cloudinary_public_id,
        url: image.cloudinary_url,
        prompt: image.prompt,
        imageStyle: image.image_style,
        downloadCount: image.download_count,
        isPublic: image.is_public,
        width: image.width,
        height: image.height,
        fileSize: image.file_size,
        createdAt: image.created_at,
        updatedAt: image.updated_at,
      })) || [],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      }
    });
    
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
} 