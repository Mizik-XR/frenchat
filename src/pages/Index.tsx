
import React, { useEffect } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/hooks/useOnboarding";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowRight, FileText } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const { loading } = useOnboarding();
  
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="max-w-3xl w-full mx-auto text-center">
            <div className="inline-flex items-center mb-8 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="text-3xl font-bold ml-2 text-gray-900 dark:text-white">FileChat</h1>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-2xl mb-8 max-w-3xl mx-auto">
              <img 
                src="/filechat-animation.gif" 
                alt="FileChat Animation" 
                className="w-full h-auto"
                onError={(e) => {
                  // Fallback en cas d'erreur de chargement du GIF
                  const target = e.target as HTMLImageElement;
                  target.src = "/lovable-uploads/fb21020a-04ad-4e58-9d53-3224ce760584.png";
                }}
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
