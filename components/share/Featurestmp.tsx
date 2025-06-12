"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Palette, Zap, ImageIcon, Wand2 } from "lucide-react"



<div className="grid md:grid-cols-3 gap-8 mt-10">
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