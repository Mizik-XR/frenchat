import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { SystemRequirements } from "@/components/landing/SystemRequirements";
import { GuideSection } from "@/components/landing/GuideSection";
import { InstallationGuide } from "@/components/landing/InstallationGuide";
import { SparklesCore } from "@/components/landing/SparklesCore";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { LoadingScreen } from "@/components/auth/LoadingScreen";

export default function Landing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isPageReady, setIsPageReady] = useState(false);
  
  const urlParams = new URLSearchParams(location.search);
  const targetSection = urlParams.get('section');

  useEffect(() => {
    console.log("Landing page loaded, auth status:", user ? "Authenticated" : "Not authenticated", "isLoading:", isLoading);
    
    if (!isLoading && user) {
      console.log("Redirecting authenticated user from Landing to /chat");
      navigate('/chat');
      return;
    }
    
    document.documentElement.classList.add("dark");
    
    const timer = setTimeout(() => {
      setIsPageReady(true);
      
      if (targetSection && isPageReady) {
        const element = document.getElementById(targetSection);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
    
    return () => {
      document.documentElement.classList.remove("dark");
      clearTimeout(timer);
    };
  }, [user, navigate, targetSection, isLoading, isPageReady]);

  if (isLoading || !isPageReady) {
    return <LoadingScreen message="Préparation de la page d'accueil..." />;
  }

  const handleJoinBeta = () => {
    navigate('/auth', { state: { tab: 'signup' } });
  };

  const handleSeeExamples = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/landing?section=features');
    }
  };

  return (
    <main className="min-h-screen bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
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
        <Navbar onJoinBeta={handleJoinBeta} />
        <Hero onJoinBeta={handleJoinBeta} onSeeExamples={handleSeeExamples} />
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="installation">
          <InstallationGuide />
        </section>
        <section id="system-requirements">
          <SystemRequirements />
        </section>
        <section id="guide">
          <GuideSection />
        </section>
      </div>
      
      <Button 
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 rounded-full p-3"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Retour en haut"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m18 15-6-6-6 6"/>
        </svg>
      </Button>
    </main>
  );
}
