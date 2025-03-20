
import { React, useEffect } from "@/core/ReactInstance";
import { toast } from "@/hooks/use-toast";
import { APP_STATE } from "@/compatibility/supabaseCompat";

/**
 * Composant qui surveille et gère les erreurs d'API
 */
export const APIErrorHandler = () => {
  useEffect(() => {
    // Fonction pour intercepter les erreurs de fetch
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
      try {
        const response = await originalFetch.apply(this, args);
        
        // Détecter les erreurs de format API
        if (response.headers.get('content-type')?.includes('application/json')) {
          const clonedResponse = response.clone();
          try {
            const data = await clonedResponse.json();
            // Logger les réponses pour déboguer
            if (import.meta.env.DEV) {
              console.log('API Response:', {
                url: args[0],
                status: response.status,
                statusText: response.statusText,
                data: data
              });
            }
          } catch (jsonError) {
            console.warn('Erreur de format JSON dans la réponse:', jsonError);
          }
        }
        
        return response;
      } catch (error) {
        // En cas d'erreur réseau, activer le mode hors ligne automatiquement
        console.error('Erreur de requête réseau:', error);
        if (error.message && (
          error.message.includes('NetworkError') || 
          error.message.includes('Failed to fetch') ||
          error.message.includes('Network request failed')
        )) {
          if (!APP_STATE.isOfflineMode) {
            console.log('Activation automatique du mode hors ligne suite à une erreur réseau');
            APP_STATE.setOfflineMode(true);
            toast({
              title: "Mode hors ligne activé",
              description: "L'application est passée en mode hors ligne suite à un problème de connexion.",
              variant: "default"
            });
          }
        }
        throw error;
      }
    };

    // Nettoyer l'intercepteur lors du démontage
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Gérer spécifiquement les erreurs liées aux ressources Facebook
  useEffect(() => {
    // Supprimer les avertissements liés à Facebook
    const originalConsoleWarn = console.warn;
    console.warn = function(...args) {
      if (args[0] && typeof args[0] === 'string' && 
          (args[0].includes('facebook.com') || 
           args[0].includes('PageView') || 
           args[0].includes('preloaded'))) {
        // Supprimer les avertissements Facebook
        return;
      }
      originalConsoleWarn.apply(this, args);
    };
    
    return () => {
      console.warn = originalConsoleWarn;
    };
  }, []);

  return null; // Ce composant ne rend rien visuellement
};
