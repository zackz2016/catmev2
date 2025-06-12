import { Navbar } from "@/components/share/Navbar"
import { Hero } from "@/components/share/Hero"
import { Features } from "@/components/share/Features"
import { Gallery } from "@/components/share/Gallery"
import { HowToUse } from "@/components/share/HowToUse"
import { Pricing } from "@/components/share/Pricing"
import { Footer } from "@/components/share/Footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      {/* <Hero /> */}
      <Features />
      <HowToUse />
      <Gallery />
      <Pricing />
      <Footer />
    </div>
  )
}
