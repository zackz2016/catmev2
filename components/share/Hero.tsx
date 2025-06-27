// Hero组件 - 主页英雄区域，包含主标题、产品介绍和行动号召按钮
"use client"

import CatQuiz from "../quiz/CatQuiz"
import { useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import { Button } from "@/components/ui/button"

export function Hero() {
  const { isSignedIn } = useUser();

  return (
    <section id="hero" className="pt-20 pb-5 bg-gray-900/50">
      <div className="container mx-auto px-4 mt-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 bg-clip-text text-transparent font-mono tracking-wide">Your AI Cat Personality in a Picture</h1>
          <p className="text-gray-400 text-2xl max-w-2xl mx-auto mb-8 font-mono tracking-wide">
            Complete 4 quiz questions to generate your exclusive cat picture
          </p>
          
          {/* 只有未注册用户才显示Start for free按钮 */}
          {/* {!isSignedIn && (
            <div className="flex justify-center">
              <SignInButton mode="modal">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-12 py-8 rounded-full text-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Start for free 🐾
                </Button>
              </SignInButton>
            </div>
          )} */}
        </div>
      </div>
    </section>
  )
} 