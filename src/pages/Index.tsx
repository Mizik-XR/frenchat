
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';
import { useAuth } from "@/components/AuthProvider";
import { LoadingScreen } from '@/components/auth/LoadingScreen';
import { isNetlifyEnvironment } from '@/utils/environment/environmentDetection';

// Composant de gestion des erreurs d'initialisation avec récupération améliorée
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  const isNetlify = isNetlifyEnvironment();
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  
  // Fonction pour réinitialiser l'application
  const handleReset = () => {
    // Nettoyage du localStorage pour éviter les problèmes persistants
    try {
      localStorage.removeItem('app_loading_issue');
      localStorage.removeItem('last_route');
    } catch (e) {
      console.warn("Erreur lors de la réinitialisation du localStorage:", e);
    }
    resetErrorBoundary();
  };
  
  // Fonction pour rediriger vers le mode cloud avec réinitialisation complète
  const handleCloudMode = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn("Erreur lors de la réinitialisation du stockage:", e);
    }
    window.location.href = '/?forceCloud=true&mode=cloud&reset=true';
  };
  
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
            onClick={handleReset}
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Réessayer
          </button>
          <button 
            onClick={handleCloudMode}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:bg-secondary/90"
          >
            Mode cloud
          </button>
          {isNetlify && (
            <button 
              onClick={() => window.location.href = '/diagnostic.html'}
              className="bg-muted text-muted-foreground px-4 py-2 rounded hover:bg-muted/90"
            >
              Diagnostic
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="mt-4 text-xs text-muted-foreground underline"
        >
          {showDebugInfo ? "Masquer" : "Afficher"} les détails techniques
        </button>
        
        {showDebugInfo && (
          <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded text-left">
            <p>Erreur: {error.name}</p>
            <p>Message: {error.message}</p>
            <p>Stack: {error.stack}</p>
            <p>Environnement Netlify: {isNetlify ? "Oui" : "Non"}</p>
            <p>URL: {window.location.href}</p>
            <p>User Agent: {navigator.userAgent}</p>
          </div>
        )}
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
        user: user ? "Authenticated" : "Not authenticated",
        isNetlify: isNetlifyEnvironment()
      });
      
      // Stocker la route pour la gestion de session
      try {
        localStorage.setItem('last_route', '/');
      } catch (e) {
        console.warn("Erreur localStorage:", e);
      }
      
      // Vérifier s'il y a des erreurs en cours
      if (window.lastRenderError) {
        console.error("Erreur précédente détectée:", window.lastRenderError);
        setError(window.lastRenderError);
      }
      
      // Polyfill pour unstable_scheduleCallback (erreurs React)
      if (typeof window.unstable_scheduleCallback === 'undefined') {
        window.unstable_scheduleCallback = function() { 
          console.warn("Polyfill: unstable_scheduleCallback appelé");
          return null;
        };
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
  
  // Vérification supplémentaire pour Netlify
  useEffect(() => {
    if (isNetlifyEnvironment()) {
      console.log("Environnement Netlify détecté dans Index.tsx");
      
      // Déclencher le diagnostic sur Netlify après un certain délai
      const diagnosticTimer = setTimeout(() => {
        if (window.showDiagnostic) {
          console.log("Exécution du diagnostic automatique depuis Index.tsx");
          window.showDiagnostic();
        }
      }, 3000);
      
      return () => clearTimeout(diagnosticTimer);
    }
  }, []);
  
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

// Ajouter des propriétés à Window pour suivre les erreurs et polyfills
declare global {
  interface Window {
    lastRenderError?: Error;
    showDiagnostic?: () => any;
    unstable_scheduleCallback?: any;
    unstable_cancelCallback?: any;
  }
}
