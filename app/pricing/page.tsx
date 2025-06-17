import { Pricing } from "@/components/share/Pricing";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black pt-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Select the perfect plan for your creative journey. Generate unique cat images that match your personality.
          </p>
        </div>
        <Pricing />
      </div>
    </div>
  );
} 