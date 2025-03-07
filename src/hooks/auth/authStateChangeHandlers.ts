
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { handleAuthSession } from "./authSessionHandlers";
import { useNavigationHelpers } from "./sessionHelpers";
import { isAuthPagePath, isPublicPagePath, handleProfileAndConfig, handleUserRedirection } from "./sessionHelpers";
import { APP_STATE } from "@/integrations/supabase/client";

/**
 * Gère les changements d'état d'authentification
 * 
 * @param event Le type d'événement d'authentification
 * @param session La session utilisateur Supabase
 * @param setIsLoading Fonction pour définir l'état de chargement
 * @param setUser Fonction pour définir l'utilisateur authentifié
 * @param setNeedsConfig Fonction pour définir si une configuration est nécessaire
 */
export const handleAuthStateChange = async (
  event: string,
  session: Session | null,
  setIsLoading: (isLoading: boolean) => void,
  setUser: (user: User | null) => void,
  setNeedsConfig: (needsConfig: boolean) => void,
  setIsFirstLogin?: (isFirstLogin: boolean) => void,
  navigationHelpers?: ReturnType<typeof useNavigationHelpers>,
  isAuthPage?: boolean
) => {
  console.info(`Auth state changed: ${event}`, `session: ${session ? 'User authenticated' : 'No session'}`);

  switch (event) {
    case 'INITIAL_SESSION':
    case 'SIGNED_IN':
      await handleAuthSession(
        session, 
        setIsLoading, 
        setUser, 
        setNeedsConfig, 
        setIsFirstLogin,
        navigationHelpers,
        isAuthPage
      );
      break;
    case 'SIGNED_OUT':
      setUser(null);
      setNeedsConfig(false);
      if (setIsFirstLogin) setIsFirstLogin(false);
      setIsLoading(false);
      break;
    default:
      break;
  }
};

/**
 * Hook personnalisé pour gérer les changements d'état d'authentification
 */
export const useAuthStateChangeHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationHelpers = useNavigationHelpers();
  const isAuthPage = isAuthPagePath(location.pathname);

  return useCallback(async (event: string, session: Session | null) => {
    if (APP_STATE.isOfflineMode) {
      console.info("Auth state change ignored in offline mode");
      return null;
    }

    let user = null;
    try {
      let needsConfig = false;
      let isFirstLogin = false;

      // Intercepter les événements de déconnexion pour gérer les redirection
      if (event === 'SIGNED_OUT' && !isPublicPagePath(location.pathname)) {
        navigate('/auth', { replace: true, state: { from: location.pathname } });
      }

      // Gérer les événements de connexion pour vérifier le profil et configurations
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        // Vérifier le profil et configuration
        const result = await handleProfileAndConfig(session.user.id);
        needsConfig = result.needsConfig;
        isFirstLogin = result.isFirstLogin;
        user = session.user;

        // Gérer la redirection si nécessaire
        if (isAuthPage) {
          handleUserRedirection(isAuthPage, needsConfig, isFirstLogin, navigationHelpers);
        }
      }

      return { user, needsConfig, isFirstLogin };
    } catch (error) {
      console.error("Error handling auth state change:", error);
      toast.error("Une erreur est survenue lors du traitement de votre authentification");
      return null;
    }
  }, [navigate, location.pathname, navigationHelpers]);
};
