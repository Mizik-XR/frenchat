import { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabase/client';
import { checkOfflineMode, APP_STATE } from '@/compatibility/supabaseCompat';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

/**
 * Hook personnalisé pour accéder au client Supabase avec prise en charge
 * de la gestion des erreurs, du mode hors ligne, et de la session utilisateur.
 * 
 * Ce hook garantit une expérience cohérente dans toute l'application,
 * et évite les problèmes de dépendances circulaires en utilisant le service centralisé.
 */
export function useSupabaseClient(): {
  client: SupabaseClient<Database>;
  isOfflineMode: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  error: Error | null;
  setOfflineMode: (value: boolean) => void;
} {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  // Obtenir l'état initial du mode hors ligne
  useEffect(() => {
    checkOfflineMode();
    setIsLoading(false);
  }, []);
  
  // Vérifier l'état de la session utilisateur
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Utiliser le service centralisé pour éviter les dépendances circulaires
        const { data, error } = await supabaseService.auth.getSession();
        
        if (error) throw error;
        
        const user = data.session?.user;
        setIsAuthenticated(!!user);
        setUserId(user?.id || null);
      } catch (err) {
        console.error("Erreur lors de la vérification de l'authentification:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!APP_STATE.isOfflineMode) {
      checkAuth();
    } else {
      // En mode hors ligne, considérer comme non authentifié
      setIsAuthenticated(false);
      setUserId(null);
      setIsLoading(false);
    }
  }, [APP_STATE.isOfflineMode]);
  
  // Écouter les changements d'état de connexion
  useEffect(() => {
    const handleOnlineStatusChange = () => {
      if (!navigator.onLine && !APP_STATE.isOfflineMode) {
        console.log('Connexion réseau perdue, activation du mode hors ligne');
        APP_STATE.setOfflineMode(true);
      }
    };
    
    // Écouter les événements de connexion
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    // Nettoyage
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);
  
  return {
    client: supabaseService.getClient(), // Utiliser le service centralisé
    isOfflineMode: APP_STATE.isOfflineMode,
    isLoading,
    isAuthenticated,
    userId,
    error,
    setOfflineMode: APP_STATE.setOfflineMode.bind(APP_STATE)
  };
}

/**
 * Hook pour accéder uniquement à la partie authentification de Supabase
 * Plus léger que le hook complet si vous n'avez besoin que de l'authentification
 */
export function useSupabaseAuth() {
  const { client, isAuthenticated, userId, isLoading, error } = useSupabaseClient();
  
  return {
    auth: client.auth,
    isAuthenticated,
    userId,
    isLoading,
    error
  };
}

/**
 * Hook pour vérifier la connectivité Supabase
 * Utile pour les composants qui doivent afficher un état hors ligne
 */
export function useSupabaseConnectivity() {
  const [isConnected, setIsConnected] = useState(!APP_STATE.isOfflineMode);
  
  useEffect(() => {
    const checkConnectivity = async () => {
      if (APP_STATE.isOfflineMode) {
        setIsConnected(false);
        return;
      }
      
      try {
        const isPingSuccessful = await supabaseService.connectivity.checkConnection();
        setIsConnected(isPingSuccessful);
      } catch {
        setIsConnected(false);
      }
    };
    
    // Vérifier la connectivité au chargement
    checkConnectivity();
    
    // Vérifier la connectivité lorsque le statut en ligne change
    const handleOnlineStatusChange = () => {
      if (navigator.onLine) {
        checkConnectivity();
      } else {
        setIsConnected(false);
      }
    };
    
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [APP_STATE.isOfflineMode]);
  
  return {
    isConnected,
    isOfflineMode: APP_STATE.isOfflineMode,
    setOfflineMode: APP_STATE.setOfflineMode.bind(APP_STATE)
  };
} 