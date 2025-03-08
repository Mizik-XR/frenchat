
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';
import { useAuth } from "@/components/AuthProvider";
import { LoadingScreen } from '@/components/auth/LoadingScreen';

// Composant de gestion des erreurs d'initialisation
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="bg-card shadow-lg rounded-lg p-6 w-full max-w-md mx-auto text-center">
        <h2 className="text-destructive text-xl font-bold mb-4">Erreur de chargement</h2>
        <p className="mb-4">Une erreur s'est produite lors du chargement de l'application:</p>
        <div className="bg-muted p-3 rounded-md mb-4 text-sm text-left overflow-auto max-h-32">
          {error.message}
        </div>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button 
            onClick={resetErrorBoundary}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Réessayer
          </button>
          <button 
            onClick={() => window.location.href = '/?forceCloud=true'}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90"
          >
            Mode cloud
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Index() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Logger pour le débogage
  useEffect(() => {
    try {
      console.log("Index page initialized", {
        isLoading,
        user: user ? "Authenticated" : "Not authenticated"
      });
      
      // Stocker la route pour la gestion de session
      localStorage.setItem('last_route', '/');
      
      // Vérifier s'il y a des erreurs en cours
      if (window.lastRenderError) {
        console.error("Erreur précédente détectée:", window.lastRenderError);
        setError(window.lastRenderError);
      }
    } catch (e) {
      console.warn("Erreur lors de l'initialisation de la page:", e);
      setError(e as Error);
    }
  }, []);

  // Séparation de la logique de redirection pour éviter les problèmes de séquence
  useEffect(() => {
    try {
      if (!isLoading) {
        setAuthChecked(true);
        if (user) {
          console.log("Redirecting authenticated user to /chat");
          navigate('/chat');
        } else {
          console.log("User not authenticated, showing landing page");
          setShowLanding(true);
        }
      }
    } catch (e) {
      console.error("Erreur lors de la redirection:", e);
      setError(e as Error);
    }
  }, [navigate, user, isLoading]);

  // Protection contre l'erreur "Cannot update during an existing state transition"
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Auth still loading after timeout, showing landing page as fallback");
        setShowLanding(true);
      }
    }, 5000); // Délai de sécurité de 5 secondes
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Si une erreur est survenue, afficher le composant de fallback
  if (error) {
    return <ErrorFallback error={error} resetErrorBoundary={() => {
      setError(null);
      window.location.reload();
    }} />;
  }
  
  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (isLoading && !authChecked && !showLanding) {
    return <LoadingScreen message="Chargement de l'application..." />;
  }
  
  // Rendre la page d'accueil (Landing) si l'utilisateur n'est pas connecté et que le chargement est terminé
  if (showLanding) {
    return <Landing />;
  }
  
  // Écran de chargement par défaut pendant les transitions
  return <LoadingScreen message="Préparation de votre expérience..." />;
}

// Ajouter une propriété à Window pour suivre les erreurs
declare global {
  interface Window {
    lastRenderError?: Error;
  }
}
