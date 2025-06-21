// 生成图片的完整类型定义
export interface GeneratedImage {
  id: number
  userId: string
  publicId: string
  url: string
  prompt?: string
  imageStyle?: string
  userRating?: number
  downloadCount: number
  shareCount: number
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
  totalShares: number
  avgRating?: number
}

// 分页信息
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

// API响应类型
export interface ImagesApiResponse {
  success: boolean
  images: GeneratedImage[]
  pagination: PaginationInfo
  error?: string
}

export interface ImageStatsApiResponse {
  success: boolean
  stats?: UserImageStats
  image?: GeneratedImage
  message?: string
  error?: string
}

// 保存图片请求类型
export interface SaveImageRequest {
  imageUrl: string
  prompt?: string
  imageStyle?: string
  isPublic?: boolean
}

// 更新图片统计请求类型
export interface UpdateImageStatsRequest {
  imageId: number
  action: 'download' | 'share' | 'rate'
  rating?: number
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