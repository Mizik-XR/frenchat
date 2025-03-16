
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeSafeMode, setupEnvironment } from '@/utils/startup/simplifiedStartup';

// Page d'attente simplifiée
const SimpleLoading = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <h2 className="text-xl font-medium text-gray-800 mb-2">Chargement de Frenchat</h2>
      <p className="text-gray-600">Préparation de votre expérience...</p>
    </div>
  </div>
);

// Page d'erreur simplifiée
const SimpleError = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-red-50 p-4">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
      <h2 className="text-xl font-medium text-red-600 mb-4 text-center">Une erreur est survenue</h2>
      <p className="text-gray-700 mb-6">{message}</p>
      <div className="space-y-3">
        <button
          onClick={onRetry}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Réessayer
        </button>
        <button
          onClick={() => window.location.href = '/?mode=safe&forceCloud=true'}
          className="w-full py-2 px-4 bg-white text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
        >
          Mode de secours
        </button>
      </div>
    </div>
  </div>
);

export default function Index() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const loadApplication = async () => {
      try {
        console.log("Initialisation de l'application...");
        
        // Initialiser le mode de secours si demandé
        initializeSafeMode();
        
        // Configurer l'environnement
        setupEnvironment();
        
        // Stocker la route pour la gestion de session
        localStorage.setItem('last_route', '/');
        
        // Vérifier si l'utilisateur est connecté
        const userString = localStorage.getItem('supabase.auth.token');
        const isAuthenticated = !!userString;
        
        // Redirection basée sur l'authentification
        if (isAuthenticated) {
          console.log("Utilisateur authentifié, redirection vers /chat");
          navigate('/chat');
        } else {
          console.log("Utilisateur non authentifié, redirection vers la landing page");
          navigate('/');
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Erreur lors du chargement:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setLoading(false);
      }
    };
    
    loadApplication();
  }, [navigate]);

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <SimpleError 
        message={error.message} 
        onRetry={() => window.location.reload()} 
      />
    );
  }
  
  // Afficher un écran de chargement pendant l'initialisation
  if (loading) {
    return <SimpleLoading />;
  }
  
  // Cette partie ne devrait pas être atteinte normalement à cause des redirections
  return <SimpleLoading />;
}
