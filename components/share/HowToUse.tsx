"use client"

export function HowToUse() {
  return (
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
  )
} 