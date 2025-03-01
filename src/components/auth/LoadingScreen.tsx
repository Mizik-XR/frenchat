
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { LogoImage } from "@/components/common/LogoImage";

interface LoadingScreenProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Chargement de FileChat", 
  showRetry = false,
  onRetry
}) => {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Afficher un bouton de relance après 10 secondes de chargement
  const shouldShowRetry = showRetry || loadingTime > 10;
  
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="flex flex-col items-center p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg max-w-md w-full">
        <LogoImage className="h-16 w-16 mb-6" />
        
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-700 mb-4"></div>
        
        <h2 className="text-xl font-semibold text-purple-900 mb-2">{message}</h2>
        <p className="text-gray-600 text-sm text-center mb-4">
          {loadingTime > 5 ? "Le chargement prend plus de temps que prévu..." : "Initialisation de l'application..."}
        </p>
        
        {shouldShowRetry && (
          <div className="flex flex-col items-center mt-2">
            <Button 
              onClick={onRetry || (() => window.location.reload())}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
            
            <Button
              variant="link"
              className="text-xs text-gray-500 mt-2"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              {showDebugInfo ? "Masquer" : "Afficher"} les informations techniques
            </Button>
          </div>
        )}
        
        {showDebugInfo && (
          <div className="mt-4 w-full bg-gray-50 p-3 rounded-md text-xs text-gray-600 overflow-x-auto">
            <p>URL: {window.location.href}</p>
            <p>Temps de chargement: {loadingTime}s</p>
            <p>User Agent: {navigator.userAgent}</p>
            <p>Timestamp: {new Date().toISOString()}</p>
            <p>Mode: {import.meta.env.MODE || "production"}</p>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        FileChat - Votre assistant d'intelligence documentaire
      </p>
    </div>
  );
};
