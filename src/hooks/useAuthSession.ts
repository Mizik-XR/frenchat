import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { APP_STATE } from '@/compatibility/supabaseCompat';
import { 
  cachedUser, 
  isSessionLoading, 
  PROTECTED_ROUTES,
  updateCachedUser,
  updateSessionLoading
} from "./auth/authConstants";
import { useSignOut } from "./auth/authActions";
import { useAuthStateChangeHandler, useInitialSessionCheck } from "./auth/authEventHandlers";

export function useAuthSession() {
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(isSessionLoading);
  const [offlineMode, setOfflineMode] = useState(APP_STATE.isOfflineMode);
  const signOut = useSignOut();
  
  const handleAuthChange = useAuthStateChangeHandler();
  const checkSession = useInitialSessionCheck();

  // Gérer le mode hors ligne
  useEffect(() => {
    const handleOfflineChange = () => {
      setOfflineMode(APP_STATE.isOfflineMode);
    };
    
    window.addEventListener('storage', (e) => {
      if (e.key === 'OFFLINE_MODE') {
        handleOfflineChange();
      }
    });
    
    return () => {
      window.removeEventListener('storage', handleOfflineChange);
    };
  }, []);

  // Setup auth state change listener and initial session check
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        const result = await handleAuthChange(event, session);
        setUser(result?.user ?? null);
        setIsLoading(false);
      });
      subscription = data.subscription;
    }
    
    // Initial session check
    checkSession().finally(() => {
      setIsLoading(false);
    });
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [handleAuthChange, checkSession]);

  // Fonction pour basculer manuellement le mode hors ligne
  const toggleOfflineMode = (value?: boolean) => {
    const newValue = value !== undefined ? value : !APP_STATE.isOfflineMode;
    APP_STATE.setOfflineMode(newValue);
    setOfflineMode(newValue);
  };

  return { 
    user, 
    isLoading, 
    signOut,
    isOfflineMode: offlineMode,
    toggleOfflineMode
  };
}

export { PROTECTED_ROUTES };
