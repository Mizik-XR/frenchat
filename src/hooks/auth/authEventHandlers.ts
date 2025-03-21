
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase, APP_STATE } from '@/integrations/supabase/client';
import { useAuthStateChangeHandler } from './authStateChangeHandlers';

export const setupAuthEventHandlers = () => {
  const handleAuthStateChange = useAuthStateChangeHandler();
  
  // Configurer les écouteurs d'événements d'authentification
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event: AuthChangeEvent, session: Session | null) => {
      await handleAuthStateChange(event, session);
    }
  );
  
  // Fonction de nettoyage pour se désabonner lors du démontage
  return () => {
    subscription?.unsubscribe();
  };
};

export default setupAuthEventHandlers;
