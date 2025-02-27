
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OnboardingIntro } from "@/components/onboarding/OnboardingIntro";
import { useOnboarding } from "@/hooks/useOnboarding";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Index() {
  const navigate = useNavigate();
  const { loading } = useOnboarding();
  const [imageError, setImageError] = useState(false);
  
  // Redirection automatique vers le chat après un délai (optionnel)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Décommentez la ligne suivante si vous souhaitez une redirection automatique
      // navigate("/chat");
    }, 5000); // 5 secondes
    
    return () => clearTimeout(timer);
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        {/* Composant d'onboarding */}
        <OnboardingIntro />
        
        <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center h-screen">
          <div className="absolute right-4 top-4">
            <ThemeToggle />
          </div>
          
          {/* GIF principal avec chemin corrigé */}
          <div className="max-w-2xl w-full mb-8 rounded-lg overflow-hidden shadow-2xl bg-white">
            {imageError ? (
              <img 
                src="/lovable-uploads/fb21020a-04ad-4e58-9d53-3224ce760584.png" 
                alt="FileChat Animation Fallback" 
                className="w-full h-auto"
              />
            ) : (
              <img 
                src="/docu-chatter/public/filechat-animation.gif" 
                alt="FileChat Animation" 
                className="w-full h-auto"
                onError={() => setImageError(true)}
              />
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              onClick={() => navigate("/chat")}
            >
              Accéder au chat
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="border-blue-400 text-blue-600 hover:bg-blue-50 px-8"
              onClick={() => navigate("/config")}
            >
              Configuration
            </Button>
          </div>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-8">
            FileChat - Solution de chat intelligent pour vos documents
          </p>
        </div>
      </div>
    </ThemeProvider>
  );
}
