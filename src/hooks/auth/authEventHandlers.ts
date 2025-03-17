
import { React } from '@/core/ReactInstance';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { isSessionLoading, updateCachedUser, updateSessionLoading } from './authConstants';
import { getUserProfileWithConfig } from './profile/profileUtils';

// Hook pour gérer les changements d'état d'authentification
export const useAuthStateChangeHandler = () => {
  return async (
    event: AuthChangeEvent,
    session: Session | null,
    setLoading?: (loading: boolean) => void,
    onAuthenticated?: () => void,
    onUnauthenticated?: () => void
  ) => {
    const user = session?.user || null;
    updateCachedUser(user);

    if (event === 'SIGNED_IN') {
      // Utilisateur connecté
      if (setLoading) setLoading(true);
      
      if (user) {
        // Charger le profil utilisateur, etc.
        try {
          const profileResult = await getUserProfileWithConfig();
          
          if (onAuthenticated) onAuthenticated();
        } catch (error) {
          console.error('Erreur lors du chargement du profil:', error);
        }
      }
      
      if (setLoading) setLoading(false);
    } else if (event === 'SIGNED_OUT') {
      // Utilisateur déconnecté
      if (onUnauthenticated) onUnauthenticated();
    }

    return { user };
  };
};

// Hook pour la vérification initiale de session
export const useInitialSessionCheck = () => {
  return async () => {
    updateSessionLoading(true);
    
    try {
      // Cette fonction doit être implémentée selon la logique de votre application
      // Elle devrait vérifier s'il y a une session active
      // et charger les données de profil si nécessaire
      
      return {};
    } catch (error) {
      console.error('Erreur lors de la vérification de session:', error);
      return {};
    } finally {
      updateSessionLoading(false);
    }
  };
};
