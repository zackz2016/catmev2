"use client"

import { Button } from "@/components/ui/button"
import { Menu, Sparkles, Coins, User } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { usePoints } from "@/hooks/use-points"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn } = useUser()
  const { points } = usePoints()
  const router = useRouter()

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
            {isSignedIn && (
              <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
                Profile
              </Link>
            )}
          </nav>

        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <>
              <div className="flex items-center space-x-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-300">{points}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/profile')}
                className="hidden md:flex border-gray-500/50 text-gray-400 hover:text-gray-300"
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/pricing')}
                className="hidden md:flex border-purple-500/50 text-purple-400 hover:text-purple-300"
              >
                充值
              </Button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button 
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
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