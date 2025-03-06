
import { useEffect } from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { SparklesCore } from "@/components/landing/SparklesCore";

export default function Landing() {
  useEffect(() => {
    // Changer le thème en sombre pour cette page spécifique
    document.documentElement.classList.add("dark");
    return () => {
      // Restaurer le thème lorsque l'utilisateur quitte la page
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      {/* Ambient background with moving particles */}
      <div className="h-full w-full absolute inset-0 z-0">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#FFFFFF"
        />
      </div>

      <div className="relative z-10">
        <Navbar />
        <Hero />
        <FeaturesSection />
        <PricingSection />
      </div>
    </main>
  );
}
