
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';
import { useAuth } from "@/components/AuthProvider";
import { LoadingScreen } from '@/components/auth/LoadingScreen';

// Fonction séparée pour simplifier le composant principal
const initSafeMode = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('mode') === 'safe') {
    console.log('Mode de démarrage sécurisé activé');
    
    // Forcer le mode cloud qui est plus stable
    localStorage.setItem('FORCE_CLOUD_MODE', 'true');
    localStorage.setItem('aiServiceType', 'cloud');
    localStorage.setItem('mode', 'safe');
    
    return true;
  }
  
  return false;
};

export default function Index() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [safeModeActive, setSafeModeActive] = useState(false);
  
  useEffect(() => {
    try {
      console.log("Index page loaded, user:", user ? "Authenticated" : "Not authenticated", "isLoading:", isLoading);
      
      // Activer le mode de secours si demandé par l'URL
      const isSafeMode = initSafeMode();
      setSafeModeActive(isSafeMode);
      
      // Stocker la route pour la gestion de session
      localStorage.setItem('last_route', '/');
      
      // Vérifier si nous sommes dans un environnement de prévisualisation
      const isPreviewEnvironment = 
        window.location.hostname.includes('lovable') || 
        window.location.hostname.includes('preview') ||
        window.location.hostname.includes('netlify');
        
      if (isPreviewEnvironment) {
        console.log("Environnement de prévisualisation détecté, activation du mode cloud");
        localStorage.setItem('FORCE_CLOUD_MODE', 'true');
        localStorage.setItem('aiServiceType', 'cloud');
      }
      
      // Gestion simplifiée du routing basé sur l'authentification
      if (!isLoading) {
        if (user) {
          console.log("Redirecting authenticated user to /chat");
          navigate('/chat');
        } else {
          console.log("User not authenticated, showing landing page");
          setShowLanding(true);
        }
      }
    } catch (err) {
      console.error("Erreur dans Index.tsx:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setShowLanding(true); // Afficher la page d'accueil en cas d'erreur
    }
  }, [navigate, user, isLoading]);

  // Afficher un message d'erreur s'il y a eu un problème
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-red-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-600 mb-4">Une erreur est survenue</h2>
          <p className="text-gray-700 mb-4">{error.message}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Rafraîchir la page
            </button>
            
            <button 
              onClick={() => window.location.href = '/?mode=safe&forceCloud=true'}
              className="w-full py-2 px-4 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
            >
              Mode de secours
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return <LoadingScreen message="Chargement de l'application..." />;
  }
  
  // Rendre la page d'accueil (Landing) si l'utilisateur n'est pas connecté et que le chargement est terminé
  if (showLanding) {
    return <Landing />;
  }
  
  // Écran de chargement par défaut pendant les transitions
  return <LoadingScreen message="Préparation de votre expérience..." />;
}
