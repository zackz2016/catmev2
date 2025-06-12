"use client"

import { Button } from "@/components/ui/button"
import { Download, Share2 } from "lucide-react"
import Image from "next/image"

const galleryImages = [
  { src: "/placeholder.svg?height=300&width=250", alt: "AI生成图片1" },
  { src: "/placeholder.svg?height=400&width=250", alt: "AI生成图片2" },
  { src: "/placeholder.svg?height=350&width=250", alt: "AI生成图片3" },
  { src: "/placeholder.svg?height=280&width=250", alt: "AI生成图片4" },
  { src: "/placeholder.svg?height=320&width=250", alt: "AI生成图片5" },
  { src: "/placeholder.svg?height=380&width=250", alt: "AI生成图片6" },
  { src: "/placeholder.svg?height=290&width=250", alt: "AI生成图片7" },
  { src: "/placeholder.svg?height=360&width=250", alt: "AI生成图片8" },
  { src: "/placeholder.svg?height=310&width=250", alt: "AI生成图片9" },
]

export function Gallery() {
  return (
    <section id="gallery" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stunning Artwork Showcase</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore amazing artworks created by users with our AI tools
          </p>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {galleryImages.map((image, index) => (
            <div key={index} className="break-inside-avoid">
              <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                <Image
                  src={image.src || "/placeholder.svg"}
                  alt={image.alt}
                  width={250}
                  height={300}
                  className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    <Button size="sm" variant="secondary" className="bg-white/20 backdrop-blur-sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-white/20 backdrop-blur-sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 