import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const { imageId, action } = await request.json();
    
    if (!imageId || !action) {
      return NextResponse.json(
        { error: 'Image ID and action are required' },
        { status: 400 }
      );
    }

    // 验证action类型 - 只支持下载统计
    const validActions = ['download'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be: download' },
        { status: 400 }
      );
    }

    // 调用数据库函数更新统计
    const { data, error } = await supabase.rpc('update_image_stats', {
      p_image_id: imageId,
      p_action: action,
      p_rating: null,
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update image statistics' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Image not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Image ${action} recorded successfully`,
    });

  } catch (error) {
    console.error('Error updating image stats:', error);
    return NextResponse.json(
      { error: 'Failed to update image statistics' },
      { status: 500 }
    );
  }
}

// 获取特定图片的统计信息
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const imageId = url.searchParams.get('imageId');
    const userId = url.searchParams.get('userId');
    
    if (!imageId && !userId) {
      return NextResponse.json(
        { error: 'Either imageId or userId is required' },
        { status: 400 }
      );
    }

    if (imageId) {
      // 获取单个图片的详细信息
      const { data: image, error } = await supabase
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
        .eq('id', imageId)
        .single();

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch image' },
          { status: 500 }
        );
      }

      if (!image) {
        return NextResponse.json(
          { error: 'Image not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        image: {
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
        }
      });
    }

    if (userId) {
      // 获取用户的图片统计信息
      const { data: stats, error } = await supabase.rpc('get_user_image_stats', {
        p_user_id: userId,
      });

      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch user stats' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        stats: stats?.[0] || {
          total_images: 0,
          public_images: 0,
          private_images: 0,
          total_downloads: 0,
        }
      });
    }

  } catch (error) {
    console.error('Error fetching image stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image statistics' },
      { status: 500 }
    );
  }
} 