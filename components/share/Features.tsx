"use client"

import CatQuiz from "../quiz/CatQuiz"

export function Features() {
  return (
    <section id="features" className="py-20 bg-gray-900/50">
      <div className="container mx-auto px-4 mt-4">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-6xl font-bold mb-4">Your AI Cat Personality in a Picture</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Experience next-generation AI image generation technology, providing unlimited possibilities for your
            creative projects
          </p>
        </div>

        {/* 生图区域 */}
        <div>
            <CatQuiz />
        </div>        
      </div>
    </section>
  )
} 