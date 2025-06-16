"use client"

import { Button } from "@/components/ui/button"
import { Menu, Sparkles } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { usePoints } from "@/hooks/use-points"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn } = useUser()
  const { points } = usePoints()

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
          {/* 显示积分 */}
          <div className="text-sm font-medium text-gray-300">
            积分: {points}
          </div>
          
          {/* 用户按钮 */}
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div className="flex items-center space-x-2">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button variant="default" size="sm">
                  注册
                </Button>
              </SignUpButton>
            </div>
          )}

          {/* 移动端菜单按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 移动端菜单 */}
      {isMenuOpen && (
        <div className="md:hidden bg-black/90 border-b border-gray-800">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
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
        </div>
      )}
    </header>
  )
} 