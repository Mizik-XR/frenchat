
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info, Home, Settings } from "lucide-react";
import { LogoImage } from "@/components/common/LogoImage";
import { Link } from "react-router-dom";

interface LoadingScreenProps {
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Chargement de Frenchat", 
  showRetry = false,
  onRetry
}) => {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [loadingTime, setLoadingTime] = useState(0);
  const [isPreviewEnvironment, setIsPreviewEnvironment] = useState(false);
  const [hasLayoutEffect, setHasLayoutEffect] = useState(false);
  
  useEffect(() => {
    // Détecter l'environnement de prévisualisation
    const hostname = window.location.hostname;
    setIsPreviewEnvironment(
      hostname.includes('lovableproject.com') || 
      hostname.includes('preview') || 
      hostname.includes('netlify')
    );
    
    const timer = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);
    
    // Vérifier si nous avons l'erreur useLayoutEffect dans la console
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string' && args[0].includes('useLayoutEffect')) {
        setHasLayoutEffect(true);
      }
      originalError.apply(console, args);
    };
    
    return () => {
      clearInterval(timer);
      console.error = originalError;
    };
  }, []);
  
  // Afficher un bouton de relance après 10 secondes de chargement
  const shouldShowRetry = showRetry || loadingTime > 10 || hasLayoutEffect;
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.href = window.location.pathname.includes('auth') 
        ? '/' 
        : window.location.pathname;
    }
  };

  const navigateHome = () => {
    window.location.href = '/';
  };
  
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="flex flex-col items-center p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg max-w-md w-full">
        <LogoImage className="h-16 w-16 mb-6" />
        
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-700 mb-4"></div>
        
        <h2 className="text-xl font-semibold text-purple-900 mb-2">{message}</h2>
        <p className="text-gray-600 text-sm text-center mb-4">
          {loadingTime > 5 ? "Le chargement prend plus de temps que prévu..." : "Initialisation de l'application..."}
        </p>
        
        {hasLayoutEffect && (
          <div className="mb-4 p-3 bg-amber-50 rounded-md w-full text-sm">
            <div className="flex items-center gap-2 text-amber-700 mb-1">
              <Info className="h-5 w-5" />
              <p className="font-medium">Problème de rendu détecté</p>
            </div>
            <p className="text-amber-600">
              Un problème avec useLayoutEffect a été détecté. Essayez de rafraîchir la page ou utilisez le bouton ci-dessous.
            </p>
          </div>
        )}
        
        {isPreviewEnvironment && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md w-full">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <Info className="h-5 w-5" />
              <p className="font-medium">Environnement de prévisualisation</p>
            </div>
            <p className="text-sm text-blue-600">
              Dans cet environnement, les fonctionnalités d'IA locale et certaines intégrations sont limitées.
            </p>
          </div>
        )}
        
        {shouldShowRetry && (
          <div className="flex flex-col items-center mt-2 space-y-2">
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="flex items-center gap-2 w-full"
            >
              <RefreshCw className="h-4 w-4" />
              Réessayer
            </Button>
            
            <Button 
              onClick={navigateHome}
              variant="default"
              className="flex items-center gap-2 w-full"
            >
              <Home className="h-4 w-4" />
              Aller à l'accueil
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
            <p>Environnement de prévisualisation: {isPreviewEnvironment ? "Oui" : "Non"}</p>
            <p>Problème useLayoutEffect détecté: {hasLayoutEffect ? "Oui" : "Non"}</p>
            <p>Route actuelle: {window.location.pathname}</p>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        Frenchat - Votre assistant d'intelligence documentaire
      </p>
    </div>
  );
};
