
import React, { useEffect, useState } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/useOnboarding";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { loading } = useOnboarding();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Fonction pour gérer l'erreur de chargement d'image
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log("Erreur de chargement de l'image, utilisation de l'image de secours");
    const target = e.target as HTMLImageElement;
    target.src = "/lovable-uploads/fb21020a-04ad-4e58-9d53-3224ce760584.png"; // Image de secours
    setIsImageLoaded(true);
  };

  // Fonction pour confirmer le chargement d'image
  const handleImageLoad = () => {
    console.log("Image chargée avec succès");
    setIsImageLoaded(true);
  };

  useEffect(() => {
    // Log pour le débogage
    console.log("Page Index montée, état de chargement:", loading);
    
    // Préchargement de l'image
    const img = new Image();
    img.src = "/filechat-animation.gif";
    img.onload = handleImageLoad;
    img.onerror = () => handleImageError({ target: img } as any);
    
    return () => {
      console.log("Page Index démontée");
    };
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Chargement en cours...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-3xl w-full mx-auto text-center">
            <div className="inline-flex items-center mb-8 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg">
              <img 
                src="/lovable-uploads/fb21020a-04ad-4e58-9d53-3224ce760584.png" 
                alt="FileChat Logo" 
                className="h-8 w-8"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              <h1 className="text-3xl font-bold ml-2 text-gray-900 dark:text-white">FileChat</h1>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl mb-8 max-w-3xl mx-auto">
              <img 
                src="/lovable-uploads/fb21020a-04ad-4e58-9d53-3224ce760584.png" 
                alt="FileChat Animation" 
                className="w-full h-auto"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
            
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Solution d'intelligence artificielle conversationnelle pour l'analyse et l'indexation de documents.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
                onClick={() => navigate("/chat")}
              >
                Accéder au chat
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                className="border-blue-400 text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg"
                onClick={() => navigate("/config")}
              >
                Configuration
              </Button>
            </div>
          </div>
        </div>
        
        <footer className="py-4 text-center text-gray-500 dark:text-gray-400">
          <p>FileChat — Solution IA pour vos documents</p>
        </footer>
      </div>
    </ThemeProvider>
  );
}
