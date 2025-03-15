
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Info, Home, Settings, AlertTriangle } from "lucide-react";
import { LogoImage } from "@/components/common/LogoImage";

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
  const [criticalErrors, setCriticalErrors] = useState<string[]>([]);
  
  useEffect(() => {
    // Détecter l'environnement de prévisualisation
    const hostname = window.location.hostname;
    setIsPreviewEnvironment(
      hostname.includes('lovableproject.com') || 
      hostname.includes('preview') || 
      hostname.includes('netlify') ||
      hostname.includes('lovable.app')
    );
    
    const timer = setInterval(() => {
      setLoadingTime(prev => prev + 1);
    }, 1000);
    
    // Vérifier si nous avons l'erreur useLayoutEffect dans la console
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0] && typeof args[0] === 'string') {
        if (args[0].includes('useLayoutEffect')) {
          setHasLayoutEffect(true);
          setCriticalErrors(prev => [...prev, 'useLayoutEffect error']);
        } else if (args[0].includes('Cannot read properties of undefined')) {
          setCriticalErrors(prev => [...prev, 'Propriété undefined: ' + args[0]]);
        }
      }
      originalError.apply(console, args);
    };
    
    // Stocker l'information que nous avons rencontré un problème de chargement
    if (loadingTime > 5) {
      localStorage.setItem('app_loading_issue', 'true');
    }
    
    // Forcer le mode cloud en environnement de prévisualisation
    if (isPreviewEnvironment) {
      localStorage.setItem('FORCE_CLOUD_MODE', 'true');
      localStorage.setItem('aiServiceType', 'cloud');
    }
    
    return () => {
      clearInterval(timer);
      console.error = originalError;
    };
  }, [loadingTime, isPreviewEnvironment]);
  
  // Afficher un bouton de relance après 10 secondes de chargement
  const shouldShowRetry = showRetry || loadingTime > 10 || hasLayoutEffect || criticalErrors.length > 0;
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Réinitialisation du cache de route
      localStorage.removeItem('app_loading_issue');
      localStorage.removeItem('last_route');
      
      // Rechargement de la page
      window.location.href = window.location.pathname.includes('auth') 
        ? '/' 
        : window.location.pathname;
    }
  };

  const navigateHome = () => {
    // Réinitialisation forcée
    localStorage.removeItem('app_loading_issue');
    localStorage.removeItem('last_route');
    window.location.href = '/?forceCloud=true&mode=cloud&client=true';
  };
  
  const clearLocalStorage = () => {
    // Nettoyage complet en cas de problème sévère
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/?reset=true&forceCloud=true&mode=cloud';
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
        
        {criticalErrors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 rounded-md w-full">
            <div className="flex items-center gap-2 text-red-700 mb-1">
              <AlertTriangle className="h-5 w-5" />
              <p className="font-medium">Erreurs critiques détectées</p>
            </div>
            <ul className="text-sm text-red-600 list-disc pl-5">
              {criticalErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        
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
              <p className="font-medium">Environnement de prévisualisation Lovable</p>
            </div>
            <p className="text-sm text-blue-600">
              Mode cloud automatiquement activé pour assurer la compatibilité.
            </p>
          </div>
        )}
        
        {shouldShowRetry && (
          <div className="flex flex-col items-center mt-2 space-y-2 w-full">
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
              Mode de secours (Cloud)
            </Button>
            
            {(loadingTime > 15 || criticalErrors.length > 0) && (
              <Button 
                onClick={clearLocalStorage}
                variant="destructive"
                className="flex items-center gap-2 w-full"
              >
                <AlertTriangle className="h-4 w-4" />
                Réinitialisation complète
              </Button>
            )}
            
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
            <p>Erreurs critiques: {criticalErrors.length}</p>
            <p>Mode cloud: {localStorage.getItem('FORCE_CLOUD_MODE') === 'true' ? "Oui" : "Non"}</p>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        Frenchat - Votre assistant d'intelligence documentaire
      </p>
    </div>
  );
};
