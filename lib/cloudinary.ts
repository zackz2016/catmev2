import { v2 as cloudinary } from 'cloudinary';

// 配置Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 上传base64图片到Cloudinary
export async function uploadImageToCloudinary(
  base64Image: string,
  userId: string,
  prompt?: string
) {
  try {
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'catme/generated-cats', // 组织文件夹
      public_id: `user_${userId}_${Date.now()}`, // 唯一ID
      tags: ['generated', 'cat', 'ai'], // 标签便于管理
      context: prompt ? `prompt=${prompt}` : undefined, // 保存提示词
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }, // 自动优化
        { width: 512, height: 512, crop: 'fit' }, // 统一尺寸
      ],
    });

    return {
      success: true,
      publicId: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

// 获取图片列表（支持分页）
export async function getCloudinaryImages(
  page: number = 1,
  limit: number = 12,
  userId?: string
) {
  try {
    const resources = await cloudinary.search
      .expression(
        userId 
          ? `folder:catme/generated-cats AND public_id:*user_${userId}*`
          : 'folder:catme/generated-cats'
      )
      .sort_by([['created_at', 'desc']])
      .max_results(limit)
      .with_field('context') // 包含上下文信息
      .execute();

    return {
      success: true,
      images: resources.resources.map((resource: any) => ({
        publicId: resource.public_id,
        url: resource.secure_url,
        createdAt: resource.created_at,
        width: resource.width,
        height: resource.height,
        context: resource.context,
        tags: resource.tags,
      })),
      total: resources.total_count,
      hasMore: resources.resources.length === limit,
    };
  } catch (error) {
    console.error('Cloudinary fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fetch failed',
      images: [],
      total: 0,
      hasMore: false,
    };
  }
}

// 删除图片（可选功能）
export async function deleteImageFromCloudinary(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result.result,
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    };
  }
}

export { cloudinary }; 