
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { BatchIndexingSection } from "@/components/landing/BatchIndexingSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { SparklesCore } from "@/components/landing/SparklesCore";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/AuthProvider";
import { LoadingScreen } from "@/components/auth/LoadingScreen";

export default function Landing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [isPageReady, setIsPageReady] = useState(false);
  
  // Récupérer la section cible des paramètres d'URL
  const urlParams = new URLSearchParams(location.search);
  const targetSection = urlParams.get('section');

  useEffect(() => {
    console.log("Landing page loaded, auth status:", user ? "Authenticated" : "Not authenticated", "isLoading:", isLoading);
    
    // Si l'utilisateur est connecté et que la vérification est terminée, le rediriger vers /chat
    if (!isLoading && user) {
      console.log("Redirecting authenticated user from Landing to /chat");
      navigate('/chat');
      return;
    }
    
    // Changer le thème en sombre pour cette page spécifique
    document.documentElement.classList.add("dark");
    
    // Marquer la page comme prête après un court délai pour éviter le flash
    const timer = setTimeout(() => {
      setIsPageReady(true);
      
      // Faire défiler jusqu'à la section cible si spécifiée
      if (targetSection && isPageReady) {
        const element = document.getElementById(targetSection);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
    
    return () => {
      // Restaurer le thème lorsque l'utilisateur quitte la page
      document.documentElement.classList.remove("dark");
      clearTimeout(timer);
    };
  }, [user, navigate, targetSection, isLoading, isPageReady]);

  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (isLoading || !isPageReady) {
    return <LoadingScreen message="Préparation de la page d'accueil..." />;
  }

  // Gestionnaires d'événements pour les boutons
  const handleJoinBeta = () => {
    navigate('/auth', { state: { tab: 'signup' } });
  };

  const handleSeeExamples = () => {
    // Faire défiler vers la section d'indexation par lots
    const batchSection = document.getElementById('batch-indexing');
    if (batchSection) {
      batchSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/landing?section=batch-indexing');
    }
  };

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
        <Navbar onJoinBeta={handleJoinBeta} />
        <Hero onJoinBeta={handleJoinBeta} onSeeExamples={handleSeeExamples} />
        <section id="features">
          <FeaturesSection />
        </section>
        <section id="batch-indexing">
          <BatchIndexingSection />
        </section>
        <section id="pricing">
          <PricingSection />
        </section>
      </div>
      
      {/* Bouton flottant de retour en haut de page */}
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
