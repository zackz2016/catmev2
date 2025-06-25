// HowToUse组件 - 为未注册用户展示产品使用流程的说明
"use client"

export function HowToUse() {
  return (
    <section id="how-to-use" className="py-0 bg-gray-900/50">
      <div className="container mx-auto px-4">
        {/* <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover your feline personality through our AI-powered quiz and get your unique cat avatar
          </p>
        </div> */}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* 步骤1 */}
          <div className="text-center relative">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-4">Complete 3 Personality Quiz Questions</h3>
            <p className="text-gray-400 leading-relaxed">
              Answer our carefully designed personality questions to help our AI understand your unique character traits and preferences
            </p>
            
            {/* 简洁箭头 */}
            <div className="hidden md:block absolute top-8 -right-4 text-purple-400">
              <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8L28 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M22 2L28 8L22 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* 步骤2 */}
          <div className="text-center relative">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-4">Choose Your Preferred Image Style</h3>
            <p className="text-gray-400 leading-relaxed">
              Select from various artistic styles including watercolor, digital art, cartoon, and more to customize your cat avatar
            </p>
            
            {/* 简洁箭头 */}
            <div className="hidden md:block absolute top-8 -right-4 text-purple-400">
              <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 8L28 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M22 2L28 8L22 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* 步骤3 */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-4">AI Generates Your Personalized Cat Avatar</h3>
            <p className="text-gray-400 leading-relaxed">
              Our advanced AI creates a unique cat image that perfectly matches your personality, style, and character
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 