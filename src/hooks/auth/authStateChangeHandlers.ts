
import { Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, APP_STATE } from '@/integrations/supabase/client';
import { updateCachedUser, updateSessionLoading } from './authConstants';
import { createInitialProfile } from './profile/profileUtils';

// Gère les changements d'état d'authentification Supabase
export const useAuthStateChangeHandler = () => {
  return async (event: AuthChangeEvent, session: Session | null) => {
    console.log(`Événement d'authentification: ${event}`);

    if (APP_STATE.isOfflineMode) {
      console.log("Mode hors ligne activé. Ignorant les changements d'état d'authentification.");
      return null;
    }

    // La session a été récupérée, utilisateur connecté
    if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
      console.log('Utilisateur connecté:', session.user.id);
      
      // Mise à jour de l'utilisateur en cache et démarrage du traitement
      updateCachedUser(session.user);
      updateSessionLoading(false);
      
      // Vérifier/créer le profil utilisateur initial
      await createInitialProfile(session.user);
      
      return { user: session.user };
    }
    
    // L'utilisateur s'est déconnecté
    if (event === 'SIGNED_OUT') {
      console.log('Utilisateur déconnecté');
      updateCachedUser(null);
      updateSessionLoading(false);
      return { user: null };
    }
    
    return { user: session?.user || null };
  };
};

export default useAuthStateChangeHandler;
