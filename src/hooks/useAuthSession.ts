
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  cachedUser, 
  isSessionLoading, 
  PROTECTED_ROUTES 
} from "./auth/authConstants";
import { 
  checkInitialSession,
  handleAuthChange as handleAuthStateChange,
  preloadAuthSession
} from "./auth/sessionUtils";
import { useSignOut } from "./auth/authActions";
import { checkUserAndConfig } from "./auth/userProfileUtils";

export function useAuthSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(isSessionLoading);
  const signOut = useSignOut();

  // Callback pour vérification du profil et config
  const checkUserAndConfigCallback = useCallback(checkUserAndConfig, []);

  // Gérer les changements d'état d'authentification
  const handleAuthChange = useCallback(async (_event: string, session: any) => {
    await handleAuthStateChange(
      _event, 
      session, 
      navigate, 
      location.pathname, 
      setUser, 
      setIsLoading
    );
  }, [navigate, location.pathname]);

  // Fonction de vérification initiale de la session
  const checkSession = useCallback(async () => {
    await checkInitialSession(navigate, location.pathname);
    setUser(cachedUser);
    setIsLoading(isSessionLoading);
  }, [navigate, location.pathname]);

  // Configurer le listener d'authentification
  useEffect(() => {
    // Précharger la session si nécessaire
    if (isSessionLoading) {
      preloadAuthSession();
    }
    
    // Mettre en place le listener d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    
    // Vérifier la session initiale uniquement si nécessaire
    if (isSessionLoading) {
      checkSession();
    }

    // Nettoyer le listener à la désinscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, handleAuthChange, checkSession]);

  return { user, isLoading, signOut };
}

// Réexporter les constantes pour usage externe
export { PROTECTED_ROUTES };
