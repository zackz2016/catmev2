"use client"

import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, User, Settings, LogOut } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { SignInButton, SignUpButton, useUser, useClerk } from "@clerk/nextjs"
import { usePoints } from "@/hooks/use-points"
import { useRouter } from "next/navigation"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isSignedIn, user } = useUser()
  const { points } = usePoints()
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = () => {
    signOut(() => router.push('/'))
  }

  // 获取用户名显示
  const getUserDisplayName = () => {
    if (!user) return "User"
    return user.fullName || user.firstName || user.username || "User"
  }

  // 获取用户头像URL
  const getUserAvatarUrl = () => {
    return user?.imageUrl || ""
  }

  // 获取用户名首字母作为头像fallback
  const getUserInitials = () => {
    const name = getUserDisplayName()
    return name.charAt(0).toUpperCase()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-1.5">
          <img 
            src="/catme_logo.png" 
            alt="CatMe Logo" 
            className="w-10 h-10 object-contain"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">CatMe</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-gray-300 hover:text-white transition-colors">
            Home
          </Link>
          <Link href="/gallery" className="text-gray-300 hover:text-white transition-colors">
            Gallery
          </Link>
          <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isSignedIn ? (
            <>
              {/* 积分显示 */}
              <span className="text-gray-300 text-sm">
                credits: {points}
              </span>
              
              {/* 用户头像下拉菜单 */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-gray-700/50 focus:bg-gray-700/50 data-[state=open]:bg-gray-700/50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={getUserAvatarUrl()} alt={getUserDisplayName()} />
                      <AvatarFallback className="bg-gray-600 text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56" 
                  align="end" 
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getUserDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.emailAddresses[0]?.emailAddress || ""}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    <span>User Center</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Admin System</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            <Link href="/" className="text-gray-300 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/gallery" className="text-gray-300 hover:text-white transition-colors">
              Gallery
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            {isSignedIn && (
              <>
                <div className="border-t border-gray-700 pt-4">
                  <div className="text-gray-300 text-sm mb-2">
                    credits: {points}
                  </div>
                  <Link href="/profile" className="text-gray-300 hover:text-white transition-colors block">
                    User Center
                  </Link>
                  <Link href="/account" className="text-gray-300 hover:text-white transition-colors block mt-2">
                    Admin System
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="text-gray-300 hover:text-white transition-colors text-left mt-2"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
} 