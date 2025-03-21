
import { supabase, APP_STATE } from '@/integrations/supabase/client';
import { updateCachedUser, updateSessionLoading } from './authConstants';
import { createInitialProfile } from './profile/profileUtils';

export function useInitialSessionCheck() {
  return async () => {
    if (APP_STATE.isOfflineMode) {
      console.log("Mode hors ligne activé, ignorant la vérification de session.");
      updateSessionLoading(false);
      return null;
    }
    
    try {
      console.log('Vérification de la session initiale...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('Aucune session active trouvée');
        updateCachedUser(null);
        updateSessionLoading(false);
        return null;
      }
      
      console.log('Session active trouvée pour:', session.user.id);
      updateCachedUser(session.user);
      
      // Vérifier si un profil existe pour l'utilisateur
      await createInitialProfile(session.user);
      
      updateSessionLoading(false);
      return session.user;
    } catch (error) {
      console.error('Erreur lors de la vérification de la session:', error);
      updateSessionLoading(false);
      return null;
    }
  };
}

export default useInitialSessionCheck;
