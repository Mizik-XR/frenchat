
import { useCallback } from "react";
import { supabase, APP_STATE } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { updateCachedUser, updateSessionLoading, PROTECTED_ROUTES } from "./authConstants";
import { 
  useNavigationHelpers, 
  handleProfileAndConfig, 
  handleUserRedirection,
  checkRouteProtection,
  isPublicPagePath,
  isAuthPagePath
} from "./sessionHelpers";

// Handle auth state changes (login/logout events)
export const useAuthStateChangeHandler = () => {
  const navigationHelpers = useNavigationHelpers();
  const { location } = navigationHelpers;

  return useCallback(async (_event: string, session: any) => {
    console.log("Auth state changed:", _event, "session:", session?.user?.id ? "User authenticated" : "No user");
    
    // Si on est en mode hors ligne, pas besoin de vérifier la session
    if (APP_STATE.isOfflineMode) {
      updateCachedUser(null);
      updateSessionLoading(false);
      return null;
    }
    
    updateCachedUser(session?.user ?? null);
    
    // Déterminer si nous sommes sur une page publique pour éviter les redirections inutiles
    const isPublicPage = isPublicPagePath(location.pathname);
    const isAuthPage = isAuthPagePath(location.pathname);
    const isProtectedRoute = PROTECTED_ROUTES.some(route => location.pathname.startsWith(route));
    
    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
    const redirected = checkRouteProtection(session, isPublicPage, isProtectedRoute, navigationHelpers);
    if (redirected) {
      updateSessionLoading(false);
      return null;
    }
    
    if (_event === 'SIGNED_IN') {
      try {
        const { profile, profileError, configs, configError, needsConfig, isFirstLogin } = 
          await handleProfileAndConfig(session.user.id);

        // Rediriger vers la configuration ou le chat selon la situation
        handleUserRedirection(isAuthPage, isFirstLogin, needsConfig, navigationHelpers);
      } catch (error) {
        console.error("Erreur lors de la vérification du statut d'utilisateur:", error);
        if (isAuthPage) {
          // En cas d'erreur, rediriger vers le chat par défaut
          navigationHelpers.navigate(navigationHelpers.getNavigationPath('/chat'));
        }
      }
    } else if (_event === 'SIGNED_OUT') {
      // Ne pas rediriger si nous sommes sur une page publique
      if (!isPublicPage && isProtectedRoute) {
        navigationHelpers.navigate(navigationHelpers.getNavigationPath('/'));
      }
    }

    updateSessionLoading(false);
    return session;
  }, [navigationHelpers]);
};

// Handle initial session check
export const useInitialSessionCheck = () => {
  const navigationHelpers = useNavigationHelpers();
  const { location } = navigationHelpers;

  return useCallback(async () => {
    // Si on est en mode hors ligne, pas besoin de vérifier la session
    if (APP_STATE.isOfflineMode) {
      console.log("Mode hors ligne actif, pas de vérification de session");
      updateCachedUser(null);
      updateSessionLoading(false);
      
      // Si on est sur une route protégée, rediriger vers la page d'accueil
      if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
        navigationHelpers.navigate(navigationHelpers.getNavigationPath('/'));
      }
      
      return null;
    }
    
    try {
      console.log("Checking initial session...");
      
      if (!supabase) {
        throw new Error("Client Supabase non disponible");
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Initial session check:", session?.user?.id ? "User authenticated" : "No user");
      
      // Déterminer si nous sommes sur une page publique
      const isPublicPage = isPublicPagePath(location.pathname);
      const isAuthPage = isAuthPagePath(location.pathname);
      const isProtectedRoute = PROTECTED_ROUTES.some(route => location.pathname.startsWith(route));
      
      if (session?.user) {
        updateCachedUser(session.user);
        
        try {
          const { profile, profileError, configs, configError, needsConfig, isFirstLogin } = 
            await handleProfileAndConfig(session.user.id);

          // Rediriger vers la configuration ou le chat selon la situation pour les pages d'auth
          handleUserRedirection(isAuthPage, isFirstLogin, needsConfig, navigationHelpers);
        } catch (error) {
          console.error("Erreur lors de la vérification du statut d'utilisateur (session initiale):", error);
        }
      } else if (!isPublicPage && isProtectedRoute) {
        navigationHelpers.navigate(navigationHelpers.getNavigationPath('/auth'), { state: { from: location.pathname } });
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la session:", error);
      updateCachedUser(null);
      
      // Si l'erreur est liée à la connectivité, activer le mode hors ligne
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') || 
        error.message.includes('Network request failed')
      )) {
        APP_STATE.setOfflineMode(true);
      }
    } finally {
      updateSessionLoading(false);
    }
  }, [navigationHelpers]);
};
