
import { Session, User } from "@supabase/supabase-js";
import { handleProfileAndConfig, handleUserRedirection, checkRouteProtection, isPublicPagePath, isAuthPagePath } from "./sessionHelpers";
import { useNavigationHelpers } from "./sessionHelpers";
import { toast } from "sonner";
import { useCallback } from "react";
import { supabase, APP_STATE } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { PROTECTED_ROUTES } from "./authConstants";

/**
 * Gère la récupération du profil et des configurations de l'utilisateur lors de la connexion
 * 
 * @param session La session utilisateur Supabase
 * @param setIsLoading Fonction pour définir l'état de chargement
 * @param setUser Fonction pour définir l'utilisateur authentifié
 * @param setNeedsConfig Fonction pour définir si une configuration est nécessaire
 */
export const handleAuthSession = async (
  session: Session | null,
  setIsLoading: (isLoading: boolean) => void,
  setUser: (user: User | null) => void,
  setNeedsConfig: (needsConfig: boolean) => void,
  setIsFirstLogin?: (isFirstLogin: boolean) => void,
  navigationHelpers?: ReturnType<typeof useNavigationHelpers>,
  isAuthPage?: boolean
) => {
  setIsLoading(true);
  console.info("Checking initial session...");

  try {
    if (!session) {
      setUser(null);
      setNeedsConfig(false);
      setIsLoading(false);
      console.info("No session found");
      return;
    }

    console.info("Initial session check: User authenticated");
    setUser(session.user);

    // Si nous sommes sur une page publique, ne pas vérifier le profil
    if (navigationHelpers && isPublicPagePath(navigationHelpers.location.pathname)) {
      setIsLoading(false);
      return;
    }

    // Récupérer le profil et les configurations
    const result = await handleProfileAndConfig(session.user.id);
    
    if (result.profileError) {
      console.error("Erreur lors de la récupération du profil:", result.profileError);
      toast.error("Erreur lors de la récupération de votre profil");
    }

    if (result.error) {
      console.error("Erreur inattendue:", result.error);
      toast.error("Une erreur est survenue lors de la récupération de vos données");
    }

    // Définir si une configuration est nécessaire
    setNeedsConfig(result.needsConfig);

    // Définir si c'est la première connexion
    if (setIsFirstLogin) {
      setIsFirstLogin(result.isFirstLogin);
    }

    // Gérer la redirection des utilisateurs si nécessaire
    if (navigationHelpers && isAuthPage) {
      handleUserRedirection(isAuthPage, result.needsConfig, result.isFirstLogin, navigationHelpers);
    }
  } catch (error) {
    console.error("Error during session handling:", error);
    toast.error("Une erreur est survenue lors de la vérification de votre session");
  } finally {
    setIsLoading(false);
  }
};

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

/**
 * Hook personnalisé pour vérifier la session initiale
 */
export const useInitialSessionCheck = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const navigationHelpers = useNavigationHelpers();

  return useCallback(async () => {
    // En mode hors ligne, ignorer la vérification
    if (APP_STATE.isOfflineMode) {
      console.info("Initial session check skipped in offline mode");
      
      // Rediriger depuis les routes protégées en mode hors ligne
      if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
        navigate('/', { replace: true });
      }
      
      return null;
    }

    try {
      if (!supabase) {
        console.error("Supabase client not available");
        throw new Error("Client Supabase non disponible");
      }

      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error retrieving session:", error);
        throw error;
      }

      // Si l'utilisateur est connecté, vérifier que la route est accessible
      if (data.session) {
        const isPublicPage = isPublicPagePath(location.pathname);
        const isProtectedPage = PROTECTED_ROUTES.some(route => location.pathname.startsWith(route));
        await checkRouteProtection(data.session, isPublicPage, isProtectedPage, navigationHelpers);
      }

      return data.session;
    } catch (error: any) {
      console.error("Error during initial session check:", error);
      
      // Si c'est une erreur réseau, activer le mode hors ligne
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network Error') ||
          error.message?.includes('network') ||
          error.message?.includes('timeout')) {
        console.warn("Network error detected, enabling offline mode");
        APP_STATE.setOfflineMode(true);
        toast.error("Mode hors ligne activé en raison de problèmes de connexion");
      } else {
        toast.error("Erreur de vérification de session: " + error.message);
      }
      
      return null;
    }
  }, [navigate, location.pathname, navigationHelpers]);
};
