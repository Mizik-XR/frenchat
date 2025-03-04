
/**
 * Utility functions for initializing the application
 */

import { QueryClient } from '@tanstack/react-query';
import { preloadSession } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { createRoot } from 'react-dom/client';
import * as React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryClientProvider } from '@tanstack/react-query';
import App from '../App';
import { LoadingScreen } from '@/components/auth/LoadingScreen';
import { verifyReactLoaded, handleLoadError, setupNetworkMonitoring } from './errorHandlingUtils';
import { isPreviewEnvironment, logEnvironmentInfo } from './environmentUtils';

// Configuration du client de requête avec optimisations
export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        // Ajouter une stratégie de cache pour améliorer la performance
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false, // Désactiver les refetch automatiques
      },
    },
  });
};

/**
 * Vérifie les variables d'environnement de Supabase
 */
export const verifySupabaseConfig = () => {
  // Utiliser des valeurs par défaut pour l'environnement de prévisualisation
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://dbdueopvtlanxgumenpu.supabase.co";
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk";
  
  console.log("Vérification des paramètres Supabase:", {
    url: supabaseUrl ? "Définie" : "Non définie",
    key: supabaseKey ? "Définie" : "Non définie",
    fromEnv: import.meta.env.VITE_SUPABASE_URL ? "Variables d'environnement" : "Valeurs par défaut",
    isPreview: isPreviewEnvironment()
  });
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Les paramètres Supabase sont manquants");
  }
  
  return { supabaseUrl, supabaseKey };
};

/**
 * Précharge la session Supabase
 */
export const preloadSupabaseSession = async () => {
  try {
    const result = await preloadSession();
    console.log("Session Supabase préchargée avec succès");
    return true;
  } catch (err: any) {
    console.error("Erreur lors du préchargement de la session:", err);
    // Notifier l'utilisateur uniquement si l'erreur est critique et pas en mode prévisualisation
    if (!isPreviewEnvironment() && (err?.message?.includes('network') || err?.message?.includes('fetch'))) {
      toast({
        title: "Problème de connexion",
        description: "Vérifiez votre connexion Internet ou réessayez plus tard.",
        variant: "destructive"
      });
    }
    // En mode prévisualisation, continuons malgré les erreurs
    return isPreviewEnvironment() ? true : false;
  }
};

/**
 * Render le fallback d'urgence en cas de problème de chargement
 */
export const renderFallback = (rootElement: HTMLElement) => {
  try {
    console.log("Délai de chargement dépassé, affichage de l'écran de secours");
    createRoot(rootElement).render(
      React.createElement(LoadingScreen, { 
        showRetry: true, 
        message: "Chargement prolongé...",
        onRetry: () => window.location.reload()
      })
    );
  } catch (error) {
    console.error("Erreur lors de l'affichage de l'écran de secours:", error);
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh;">
        <h2>Chargement prolongé...</h2>
        <p>Veuillez rafraîchir la page.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px;">
          Rafraîchir
        </button>
      </div>
    `;
  }
};

/**
 * Monte l'application React dans le DOM
 */
export const mountReactApp = (queryClient: QueryClient) => {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Élément #root non trouvé dans le DOM");
  }
  
  console.log("Élément #root trouvé, montage de l'application React");
  
  try {
    const root = createRoot(rootElement);
    
    root.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          ErrorBoundary,
          null,
          React.createElement(
            QueryClientProvider,
            { client: queryClient },
            React.createElement(App, null)
          )
        )
      )
    );
    
    console.log("Application React montée avec succès");
    
    // Configurer la surveillance réseau
    setupNetworkMonitoring();
  } catch (error) {
    console.error("Erreur lors du montage de l'application React:", error);
    handleLoadError(error);
    throw error;
  }
};

/**
 * Démarre l'application avec une gestion des erreurs
 */
export const startApp = async (): Promise<boolean> => {
  try {
    console.log("Démarrage de l'application...");
    
    // Log environnement
    logEnvironmentInfo();
    
    // Vérifier que React est correctement chargé
    if (!verifyReactLoaded()) {
      console.error("React n'est pas correctement chargé, tentative de repli...");
      // En mode prévisualisation, on peut essayer de continuer malgré tout
      if (!isPreviewEnvironment()) {
        throw new Error("React n'est pas correctement chargé");
      }
    }
    
    // Vérification des paramètres Supabase
    verifySupabaseConfig();
    
    // Précharger la session Supabase pendant le chargement initial
    await preloadSupabaseSession();

    // Créer le client de requête
    const queryClient = createQueryClient();
    
    // Monter l'application React
    mountReactApp(queryClient);
    
    return true;
  } catch (error) {
    console.error("Erreur lors du montage de l'application:", error);
    handleLoadError(error);
    return false;
  }
};
