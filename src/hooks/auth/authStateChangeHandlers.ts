
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { APP_STATE } from '@/contexts/AppStateContext';

// Fonction unifiée pour gérer les changements d'état d'authentification
export const handleAuthStateChange = async (
  event: AuthChangeEvent,
  session: Session | null,
  setLoading: (loading: boolean) => void,
  onAuthenticated: () => void,
  onUnauthenticated: () => void
) => {
  setLoading(true);
  
  try {
    switch (event) {
      case 'SIGNED_IN':
        if (session && session.user) {
          const { error } = await supabase
            .from('profiles')
            .upsert(
              { 
                id: session.user.id,
                email: session.user.email,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'id' }
            );
            
          if (error) {
            console.error('Error updating profile:', error);
          }
          
          onAuthenticated();
          APP_STATE.setAuthenticated(true);
        }
        break;
        
      case 'SIGNED_OUT':
        onUnauthenticated();
        APP_STATE.setAuthenticated(false);
        break;
        
      case 'USER_UPDATED':
        if (session && session.user) {
          onAuthenticated();
          APP_STATE.setAuthenticated(true);
        }
        break;
        
      default:
        // Ne rien faire pour les autres événements
        break;
    }
  } catch (error) {
    console.error('Error handling auth state change:', error);
  } finally {
    setLoading(false);
  }
};

// Pour compatibilité
export const handleAuthChange = handleAuthStateChange;

// Exporter une fonction nommée pour compatibilité avec d'autres imports
export const useAuthStateChangeHandler = () => {
  return {
    handleAuthStateChange
  };
};
