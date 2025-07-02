// 生成图片的完整类型定义
export interface GeneratedImage {
  id: number
  userId: string
  publicId: string
  url: string
  prompt?: string
  imageStyle?: string
  downloadCount: number
  isPublic: boolean
  width?: number
  height?: number
  fileSize?: number
  createdAt: string
  updatedAt?: string
  tags?: string[]
}

// 用户图片统计信息
export interface UserImageStats {
  totalImages: number
  publicImages: number
  privateImages: number
  totalDownloads: number
}

// 分页信息
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

// API响应格式
export interface ImagesApiResponse {
  success: boolean
  images: GeneratedImage[]
  pagination: PaginationInfo
  error?: string
}

// 保存图片请求格式
export interface SaveImageRequest {
  imageUrl: string
  prompt?: string
  imageStyle?: string
  isPublic?: boolean
  width?: number
  height?: number
  fileSize?: number
}

// 保存图片响应格式
export interface SaveImageResponse {
  success: boolean
  imageId?: number
  error?: string
}

// 更新图片统计请求类型
export interface UpdateImageStatsRequest {
  imageId: number
  action: 'download'
}

// Cloudinary上传结果类型
export interface CloudinaryUploadResult {
  success: boolean
  publicId?: string
  url?: string
  width?: number
  height?: number
  error?: string
} 