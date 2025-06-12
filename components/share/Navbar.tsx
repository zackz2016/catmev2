"use client"

import { Button } from "@/components/ui/button"
import { Menu, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Cat me</span>
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
  )
} 