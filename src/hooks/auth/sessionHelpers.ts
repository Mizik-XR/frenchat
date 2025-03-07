
import { useNavigate, useLocation } from "react-router-dom";
import { supabase, APP_STATE } from "@/integrations/supabase/client";
import { getFormattedUrlParams } from "@/utils/environment";
import { toast } from "@/hooks/use-toast";

// Helper for navigation handling with persisted URL parameters
export const useNavigationHelpers = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      mode: searchParams.get('mode'),
      client: searchParams.get('client') === 'true',
      forceCloud: searchParams.get('forceCloud') === 'true',
    };
  };

  const getNavigationPath = (path: string) => {
    const persistedParams = getFormattedUrlParams();
    return `${path}${persistedParams}`;
  };

  return { 
    navigate, 
    location, 
    getUrlParams, 
    getNavigationPath 
  };
};

// Handle profile retrieval and creation
export const handleProfileAndConfig = async (userId: string) => {
  try {
    // Vérifier si le profil existe et le créer si nécessaire
    const { data: profile, error: profileError } = await supabase.handleProfileQuery(userId);
      
    if (profileError) {
      console.error("Erreur lors de la récupération du profil:", profileError);
      toast({
        title: "Erreur de profil",
        description: "Impossible de récupérer votre profil. Certaines fonctionnalités peuvent être limitées.",
        variant: "destructive",
      });
    }

    // Vérifier l'état des configurations des services
    let configs = null;
    let configError = null;
    
    try {
      const result = await supabase
        .from('service_configurations')
        .select('service_type, status')
        .in('service_type', ['google_drive', 'microsoft_teams', 'llm']);
      
      configs = result.data;
      configError = result.error;
    } catch (err) {
      console.error("Erreur lors de la récupération des configurations:", err);
      configError = err instanceof Error ? err : new Error("Erreur inconnue");
    }

    return {
      profile,
      profileError,
      configs,
      configError,
      needsConfig: !configs || !configs.length || !configs.some(c => c.status === 'configured'),
      isFirstLogin: profile?.is_first_login
    };
  } catch (error) {
    console.error("Erreur lors de la vérification du statut d'utilisateur:", error);
    return { error };
  }
};

// Determine if user should be redirected based on login and config status
export const handleUserRedirection = (
  isAuthPage: boolean, 
  isFirstLogin: boolean, 
  needsConfig: boolean,
  navigationHelpers: ReturnType<typeof useNavigationHelpers>
) => {
  const { navigate, getNavigationPath } = navigationHelpers;
  
  if (isAuthPage) {
    if (isFirstLogin || needsConfig) {
      console.log("Redirection vers la configuration (nouveau compte ou configuration requise)");
      navigate(getNavigationPath('/config'));
    } else {
      console.log("Redirection vers le chat (utilisateur déjà configuré)");
      navigate(getNavigationPath('/chat'));
    }
  }
};

// Handle checking route protection and redirects
export const checkRouteProtection = (
  session: any, 
  isPublicPage: boolean,
  isProtectedRoute: boolean,
  navigationHelpers: ReturnType<typeof useNavigationHelpers>
) => {
  const { navigate, location, getNavigationPath } = navigationHelpers;
  
  if (!session?.user && isProtectedRoute) {
    console.log("Redirection vers auth depuis route protégée:", location.pathname);
    navigate(getNavigationPath('/auth'), { state: { from: location.pathname } });
    return true;
  }
  
  return false;
};

// Check if current path is a public page
export const isPublicPagePath = (pathname: string): boolean => {
  return pathname === '/' || 
    pathname === '/landing' || 
    pathname.startsWith('/landing') ||
    pathname === '/home' || 
    pathname === '/index';
};

// Check if current path is an auth page
export const isAuthPagePath = (pathname: string): boolean => {
  return pathname === '/auth' || pathname.startsWith('/auth/');
};
