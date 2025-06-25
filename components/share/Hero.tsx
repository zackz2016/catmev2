// Hero组件 - 主页英雄区域，包含主标题、产品介绍和行动号召按钮
"use client"

import CatQuiz from "../quiz/CatQuiz"
import { useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';
import { Button } from "@/components/ui/button"

export function Hero() {
  const { isSignedIn } = useUser();

  return (
    <section id="hero" className="pt-12 pb-2 bg-gray-900/50">
      <div className="container mx-auto px-4 mt-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-6xl font-bold mb-4">Your AI Cat Personality in a Picture</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
            Experience next-generation AI image generation technology, providing unlimited possibilities for your
            creative projects
          </p>
          
          {/* 只有未注册用户才显示Start for free按钮 */}
          {!isSignedIn && (
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
          )}
        </div>
      </div>
    </section>
  )
} 