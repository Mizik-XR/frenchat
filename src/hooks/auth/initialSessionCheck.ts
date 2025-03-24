import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { APP_STATE } from '@/compatibility/supabaseCompat';
import { supabase } from '@/integrations/supabase/client';
import { useNavigationHelpers } from "./navigation/navigationHelpers";
import { isPublicPagePath } from "./routes/routeHelpers";
import { checkRouteProtection } from "./redirection/redirectionUtils";
import { PROTECTED_ROUTES } from "./authConstants";

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
