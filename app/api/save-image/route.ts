import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // 验证用户身份
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to save images' },
        { status: 401 }
      );
    }

    const { imageUrl, prompt, imageStyle, isPublic = true } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // 上传图片到Cloudinary
    const uploadResult = await uploadImageToCloudinary(imageUrl, userId, prompt);
    
    if (!uploadResult.success) {
      return NextResponse.json(
        { error: uploadResult.error || 'Failed to upload image' },
        { status: 500 }
      );
    }

    // 保存图片信息到数据库，包含更多元数据
    const { data: savedImage, error: dbError } = await supabase
      .from('generated_images')
      .insert([{
        user_id: userId,
        cloudinary_public_id: uploadResult.publicId,
        cloudinary_url: uploadResult.url,
        prompt: prompt || null,
        image_style: imageStyle || 'watercolor',
        width: uploadResult.width || 512,
        height: uploadResult.height || 512,
        is_public: isPublic,
        download_count: 0,
        share_count: 0,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // 如果数据库保存失败，考虑是否删除已上传的图片
      // await deleteImageFromCloudinary(uploadResult.publicId);
      return NextResponse.json(
        { error: 'Failed to save image information' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: {
        id: savedImage.id,
        publicId: uploadResult.publicId,
        url: uploadResult.url,
        prompt: prompt,
        imageStyle: imageStyle,
        isPublic: isPublic,
        width: uploadResult.width,
        height: uploadResult.height,
        createdAt: savedImage.created_at,
      }
    });

  } catch (error) {
    console.error('Error saving image:', error);
    return NextResponse.json(
      { error: 'Failed to save image' },
      { status: 500 }
    );
  }
} 