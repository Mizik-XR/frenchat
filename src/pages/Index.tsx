
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';
import { useAuth } from "@/components/AuthProvider";
import { LoadingScreen } from '@/components/auth/LoadingScreen';

export default function Index() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    console.log("Index page loaded, user:", user ? "Authenticated" : "Not authenticated", "isLoading:", isLoading);
    
    try {
      // Stocker la route pour la gestion de session
      localStorage.setItem('last_route', '/');
      
      // Vérifier si nous sommes dans un environnement de prévisualisation
      const isPreviewEnvironment = window.location.hostname.includes('lovable');
      if (isPreviewEnvironment) {
        console.log("Environnement de prévisualisation détecté, activation du mode cloud");
        localStorage.setItem('FORCE_CLOUD_MODE', 'true');
        localStorage.setItem('aiServiceType', 'cloud');
      }
      
      // Seulement rediriger après que le statut d'authentification soit confirmé
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
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Rafraîchir la page
          </button>
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
