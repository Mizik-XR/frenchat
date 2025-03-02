
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { LogoImage } from "@/components/common/LogoImage";
import { Loader2, RefreshCw, ExternalLink, Info } from 'lucide-react';

interface AuthLoadingScreenProps {
  message?: string;
  duration?: number;
  onRetry?: () => void;
}

export const AuthLoadingScreen: React.FC<AuthLoadingScreenProps> = ({ 
  message = "Authentification en cours...", 
  duration = 15000,
  onRetry
}) => {
  const [isLongLoading, setIsLongLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [isPreviewEnvironment, setIsPreviewEnvironment] = useState(false);

  useEffect(() => {
    // Détecter si nous sommes dans un environnement de prévisualisation
    const hostname = window.location.hostname;
    setIsPreviewEnvironment(
      hostname.includes('lovableproject.com') || 
      hostname.includes('preview') || 
      hostname.includes('netlify')
    );
    
    // Si le chargement dure trop longtemps, afficher un message spécifique
    const timeout = setTimeout(() => {
      setIsLongLoading(true);
    }, duration);

    return () => clearTimeout(timeout);
  }, [duration]);

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="flex flex-col items-center p-8 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg max-w-md w-full">
        <LogoImage className="h-16 w-16 mb-6" />
        
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600 mb-4"></div>
        
        {message && <p className="text-purple-700 text-center font-medium mb-2">{message}</p>}
        
        {isPreviewEnvironment && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md w-full">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Info className="h-5 w-5" />
              <p className="font-medium">Environnement de prévisualisation</p>
            </div>
            <p className="text-sm text-blue-600 mb-2">
              Vous êtes dans un environnement de prévisualisation où certaines fonctionnalités sont limitées.
            </p>
            <p className="text-sm text-blue-600">
              Pour une expérience complète, clonez le projet et lancez-le en local.
            </p>
          </div>
        )}
        
        {isLongLoading && (
          <div className="mt-4 flex flex-col items-center space-y-4">
            <p className="text-orange-600 text-sm text-center">
              Le chargement semble prendre plus de temps que prévu.
            </p>
            
            {onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline" 
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
            )}
            
            <Button 
              variant="link" 
              className="text-xs text-gray-500"
              onClick={() => setShowDebug(!showDebug)}
            >
              Afficher les informations de débogage
            </Button>
            
            {showDebug && (
              <div className="text-xs text-gray-600 bg-gray-100 p-3 rounded-md w-full">
                <p>URL actuelle: {window.location.href}</p>
                <p>User Agent: {navigator.userAgent}</p>
                <p>Date/Heure: {new Date().toLocaleString()}</p>
                <p>LocalStorage disponible: {typeof localStorage !== 'undefined' ? 'Oui' : 'Non'}</p>
                <p>Environnement de prévisualisation: {isPreviewEnvironment ? 'Oui' : 'Non'}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        Frenchat - Votre assistant d'intelligence documentaire
      </p>
    </div>
  );
};
