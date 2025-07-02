"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2, Download, Share2, ZoomIn } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import type { GeneratedImage, PaginationInfo, ImagesApiResponse } from "@/types/images"

export function Gallery() {
  const { toast } = useToast()
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasMore: false,
  })
  const [error, setError] = useState<string | null>(null)
  
  // 添加大图模态框状态
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [showModal, setShowModal] = useState(false)

  // 获取图片列表
  const fetchImages = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/images?page=${page}&limit=${pagination.limit}&public=true`)
      const data: ImagesApiResponse = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch images')
      }
      
      if (data.success) {
        setImages(data.images)
        setPagination(data.pagination)
      } else {
        throw new Error(data.error || 'Failed to load images')
      }
    } catch (error) {
      console.error('Error fetching images:', error)
      setError(error instanceof Error ? error.message : 'Failed to load images')
      toast({
        title: "加载失败",
        description: "无法加载图片，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // 组件挂载时加载图片
  useEffect(() => {
    fetchImages(1)
  }, [])

  // 处理分页
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchImages(newPage)
    }
  }

  // 下载图片
  const handleDownload = async (imageUrl: string, filename: string, imageId: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      // 更新下载统计
      try {
        await fetch('/api/images/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId, action: 'download' }),
        })
      } catch (statsError) {
        console.error('Failed to update download stats:', statsError)
      }
      
      toast({
        title: "下载成功",
        description: "图片已保存到本地",
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "下载失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  // 分享图片
  const handleShare = async (imageUrl: string, imageId: number, prompt?: string) => {
    try {
      // 验证URL格式是否有效
      const isValidUrl = (url: string) => {
        try {
          new URL(url)
          return url.startsWith('http://') || url.startsWith('https://')
        } catch {
          return false
        }
      }

      if (navigator.share && isValidUrl(imageUrl)) {
        await navigator.share({
          title: 'AI生成的猫咪图片',
          text: prompt || '看看这只可爱的AI猫咪！',
          url: imageUrl,
        })
      } else {
        // 回退到复制链接
        await navigator.clipboard.writeText(imageUrl)
        toast({
          title: "链接已复制",
          description: "图片链接已复制到剪贴板",
        })
      }
      
      // 更新分享统计
      try {
        await fetch('/api/images/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId, action: 'share' }),
        })
      } catch (statsError) {
        console.error('Failed to update share stats:', statsError)
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') { // 用户取消分享不算错误
        console.error('Share error:', error)
        toast({
          title: "分享失败",
          description: "无法复制链接",
          variant: "destructive",
        })
      }
    }
  }

  // 打开大图模态框
  const handleImageClick = (image: GeneratedImage) => {
    setSelectedImage(image)
    setShowModal(true)
  }

  return (
    <section className="py-20 pt-40 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-mono">Gallery</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-mono">
            Explore amazing AI-generated cat artworks created by our community
          </p>
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="ml-2 text-gray-400">Loading images...</span>
          </div>
        )}

        {/* 错误状态 */}
        {error && !loading && (
          <div className="text-center py-20">
            <p className="text-red-400 mb-4">{error}</p>
            <Button onClick={() => fetchImages(pagination.page)} variant="outline">
              Retry
            </Button>
          </div>
        )}

        {/* 图片展示 */}
        {!loading && !error && images.length > 0 && (
          <>
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {images.map((image) => (
                <div key={image.id} className="break-inside-avoid">
                  <div 
                    className="relative group cursor-pointer overflow-hidden rounded-lg"
                    onClick={() => handleImageClick(image)}
                  >
                    <Image
                      src={image.url}
                      alt={image.prompt || `AI生成图片 ${image.id}`}
                      width={250}
                      height={300}
                      className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        // 图片加载失败时的处理
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=300&width=250"
                      }}
                    />

                    {/* 悬停时显示放大图标 */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2 text-gray-800 font-medium">
                        <ZoomIn className="w-4 h-4" />
                        <span className="text-sm">View</span>
                      </div>
                    </div>

                    {/* 提示词工具提示 */}
                    {image.prompt && (
                      <div className="absolute top-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-2">
                          <p className="text-white text-xs line-clamp-2">{image.prompt}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 分页控件 */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center mt-12 gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="flex items-center gap-2 text-black"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2 text-black">
                  {/* 页码显示 */}
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="flex items-center gap-2 text-black"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* 分页信息 */}
            {/* <div className="text-center mt-4 text-gray-400 text-sm">
              Showing {((pagination.page - 1) * pagination.limit + 1)} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} images
            </div> */}
          </>
        )}

        {/* 空状态 */}
        {!loading && !error && images.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">还没有生成的图片</p>
            <p className="text-gray-500">开始测试生成你的第一张AI猫咪图片吧！</p>
          </div>
        )}
      </div>

              {/* 大图模态框 */}
        {selectedImage && (
          <Dialog open={showModal} onOpenChange={setShowModal}>
            <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-gray-900"> 
              <div className="relative">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.prompt || `AI生成图片 ${selectedImage.id}`}
                  className="w-full h-auto max-h-[80vh] object-contain mt-10 mb-10"
                  onError={(e) => {
                    // 图片加载失败时的处理
                    const target = e.target as HTMLImageElement
                    target.src = "/placeholder.svg?height=600&width=600"
                  }}
                />
                
                {/* 下载和分享按钮 */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={() => handleDownload(
                      selectedImage.url, 
                      `catme-${selectedImage.id}.jpg`, 
                      selectedImage.id
                    )}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="bg-white/20 backdrop-blur-sm hover:bg-white/30"
                    onClick={() => handleShare(
                      selectedImage.url, 
                      selectedImage.id, 
                      selectedImage.prompt
                    )}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
                
                {/* 提示词显示 */}
                {selectedImage.prompt && (
                  <div className="absolute top-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-white text-sm leading-relaxed">{selectedImage.prompt}</p>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
    </section>
  )
} 