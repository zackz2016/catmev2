"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Zap,
  Download,
  Share2,
  Star,
  Check,
  X,
  Facebook,
  Twitter,
  Instagram,
  Github,
  Mail,
  Phone,
  MapPin,
  Menu,
  ChevronRight,
  Palette,
  Wand2,
  ImageIcon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function Component() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  // 客户推荐数据
  const testimonials = [
    {
      name: "Alex Chen",
      role: "Designer",
      content: "This AI image generation tool has completely transformed my workflow, the quality is amazing!",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Sarah Johnson",
      role: "Content Creator",
      content: "Clean and easy-to-use interface, image quality exceeds expectations, highly recommended!",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Mike Wilson",
      role: "Marketing Expert",
      content: "Saved us tremendous time and cost for our marketing campaigns, excellent results.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
    {
      name: "Emma Davis",
      role: "Freelancer",
      content: "As a freelancer, this tool has helped me improve both productivity and income.",
      rating: 5,
      avatar: "/placeholder.svg?height=60&width=60",
    },
  ]

  // 瀑布流图片数据
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

  // 自动轮播推荐
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 固定导航 */}
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">AI Image Studio</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#gallery" className="text-gray-300 hover:text-white transition-colors">
              Gallery
            </Link>
            <Link href="#how-to-use" className="text-gray-300 hover:text-white transition-colors">
              How to Use
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="hidden md:inline-flex text-gray-300 hover:text-white">
              Sign In
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Start Creating
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-md border-t border-gray-800">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <Link href="#features" className="block text-gray-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#gallery" className="block text-gray-300 hover:text-white transition-colors">
                Gallery
              </Link>
              <Link href="#how-to-use" className="block text-gray-300 hover:text-white transition-colors">
                How to Use
              </Link>
              <Link href="#pricing" className="block text-gray-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                Sign In
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero部分 */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900/20 via-black to-pink-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30">
            🎨 AI-Powered Image Generation
          </Badge>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Unleash Infinite Creative Possibilities
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform your imagination into stunning visual masterpieces using cutting-edge AI technology. Create
            professional-grade images in just seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-3"
            >
              Start Creating Now
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 text-lg px-8 py-3"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* 功能部分 */}
      <section id="features" className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful AI Creation Features</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience next-generation AI image generation technology, providing unlimited possibilities for your
              creative projects
            </p>
          </div>

          {/* 预留的正方形区域 */}
          <div className="flex justify-center mb-16">
            <div className="w-80 h-80 md:w-96 md:h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-400">AI Generation Interface</p>
                <p className="text-sm text-gray-500 mt-2">Coming Soon</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Smart Creation</CardTitle>
                <CardDescription className="text-gray-400">
                  Based on advanced AI algorithms, understand your creative needs and generate high-quality original
                  images
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Lightning Fast</CardTitle>
                <CardDescription className="text-gray-400">
                  Optimized processing workflow, complete image generation in seconds, boosting your productivity
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <ImageIcon className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">Diverse Styles</CardTitle>
                <CardDescription className="text-gray-400">
                  Support multiple artistic styles and image types, meeting creative needs for different scenarios
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 图片库部分 - 瀑布流 */}
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

      {/* 使用方法部分 */}
      <section id="how-to-use" className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in 3 Simple Steps</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              No complex operations needed, easily master AI image generation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Enter Description</h3>
              <p className="text-gray-400">
                Describe the image you want to create in natural language, the more detailed the better
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Choose Style</h3>
              <p className="text-gray-400">
                Select the style template that best fits your needs from various artistic styles
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Generate & Download</h3>
              <p className="text-gray-400">
                Click the generate button and download your exclusive AI artwork in seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 客户推荐部分 */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Users Love Our Platform</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              See what other users really think about our product
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div key={index} className="w-full flex-shrink-0">
                    <Card className="bg-gray-800/50 border-gray-700 max-w-2xl mx-auto">
                      <CardContent className="p-8 text-center">
                        <div className="flex justify-center mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                          ))}
                        </div>
                        <p className="text-lg text-gray-300 mb-6 italic">"{testimonial.content}"</p>
                        <div className="flex items-center justify-center space-x-4">
                          <Image
                            src={testimonial.avatar || "/placeholder.svg"}
                            alt={testimonial.name}
                            width={60}
                            height={60}
                            className="rounded-full"
                          />
                          <div>
                            <p className="font-semibold text-white">{testimonial.name}</p>
                            <p className="text-gray-400">{testimonial.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* 指示器 */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? "bg-purple-500" : "bg-gray-600"
                  }`}
                  onClick={() => setCurrentTestimonial(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 定价部分 */}
      <section id="pricing" className="py-20 bg-gray-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Perfect Plan</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Flexible pricing options to meet different needs of individuals and businesses
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 入门级 */}
            <Card className="bg-gray-800/50 border-gray-700 relative">
              <CardHeader>
                <CardTitle className="text-white text-xl">Starter</CardTitle>
                <CardDescription className="text-gray-400">Perfect for personal users and light usage</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">¥29</span>
                  <span className="text-gray-400">/月</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">100 images per month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Basic style templates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Standard resolution</span>
                  </li>
                  <li className="flex items-center">
                    <X className="w-5 h-5 text-gray-500 mr-3" />
                    <span className="text-gray-500">Commercial usage rights</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-gray-700 hover:bg-gray-600">Choose Starter</Button>
              </CardContent>
            </Card>

            {/* 专业级 */}
            <Card className="bg-gradient-to-b from-purple-500/10 to-pink-500/10 border-purple-500/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-white text-xl">Professional</CardTitle>
                <CardDescription className="text-gray-400">
                  Ideal for professional creators and small teams
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">¥99</span>
                  <span className="text-gray-400">/月</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">500 images per month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">All style templates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">HD resolution</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Commercial usage rights</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Priority processing</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  Choose Professional
                </Button>
              </CardContent>
            </Card>

            {/* 企业级 */}
            <Card className="bg-gray-800/50 border-gray-700 relative">
              <CardHeader>
                <CardTitle className="text-white text-xl">Enterprise</CardTitle>
                <CardDescription className="text-gray-400">
                  Perfect for large teams and enterprise users
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">¥299</span>
                  <span className="text-gray-400">/月</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Unlimited image generation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Custom style templates</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Ultra HD resolution</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Extended commercial rights</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">Dedicated customer support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="w-5 h-5 text-green-400 mr-3" />
                    <span className="text-gray-300">API access</span>
                  </li>
                </ul>
                <Button className="w-full mt-6 bg-gray-700 hover:bg-gray-600">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 最终CTA部分 */}
      <section className="py-20 bg-gradient-to-r from-purple-900/50 via-black to-pink-900/50 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Ready to Unleash Your Creativity?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of creators and experience the unlimited possibilities of AI image generation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-3"
            >
              Start Free Trial Now
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 text-lg px-8 py-3"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* 公司信息 */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">AI Image Studio</span>
              </div>
              <p className="text-gray-400 mb-4">
                Leading AI image generation platform providing creators with unlimited visual creation possibilities.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                  <Github className="w-5 h-5" />
                </Link>
              </div>
            </div>

            {/* 产品链接 */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    AI Image Generation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Style Templates
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Batch Processing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    API Integration
                  </Link>
                </li>
              </ul>
            </div>

            {/* 支持链接 */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* 联系方式 */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-400">
                  <Mail className="w-4 h-4 mr-2" />
                  support@aiimage.com
                </li>
                <li className="flex items-center text-gray-400">
                  <Phone className="w-4 h-4 mr-2" />
                  400-123-4567
                </li>
                <li className="flex items-center text-gray-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  Tech Park, Beijing, China
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2024 AI Image Studio. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
