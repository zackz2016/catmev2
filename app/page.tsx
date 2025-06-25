// 猫咪生成器主页 - 集成各个功能模块的首页
'use client';

import { Hero } from "@/components/share/Hero"
import { HowToUse } from "@/components/share/HowToUse"
import { Pricing } from "@/components/share/Pricing"
import CatQuiz from "@/components/quiz/CatQuiz"
import { useUser } from '@clerk/nextjs';
import { Gallery } from "@/components/share/Gallery";

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <div className="pt-10">
      <Hero />
      {isSignedIn && <CatQuiz />}
      {!isSignedIn && <HowToUse />}
      {<Gallery />}
      {!isSignedIn && <Pricing isSection />}
    </div>
  )
}
