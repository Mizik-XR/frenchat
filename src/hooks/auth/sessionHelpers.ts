
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook pour faciliter la navigation et la gestion des paramètres d'URL
 */
export const useNavigationHelpers = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Récupère les paramètres d'URL actuels
   */
  const getUrlParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      mode: params.get("mode") || "auto",
      client: params.get("client") === "true",
      forceCloud: params.get("forceCloud") === "true",
    };
  };

  /**
   * Génère un chemin de navigation en préservant les paramètres d'URL actuels
   */
  const getNavigationPath = (path: string) => {
    const params = new URLSearchParams(location.search);
    return `${path}?${params.toString()}`;
  };

  return { navigate, location, getUrlParams, getNavigationPath };
};

/**
 * Gère la récupération du profil utilisateur et de sa configuration
 */
export const handleProfileAndConfig = async (userId: string) => {
  if (!userId) return { profile: null, configs: [], needsConfig: false, isFirstLogin: false };

  try {
    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Erreur lors de la récupération du profil:", profileError);
      return { profile: null, profileError, configs: [], needsConfig: true, isFirstLogin: false };
    }

    // Récupérer les configurations de l'utilisateur
    const { data: configs, error: configError } = await supabase
      .from("service_configurations")
      .select("*")
      .eq("user_id", userId);

    if (configError) {
      console.error("Erreur lors de la récupération des configurations:", configError);
      return { profile, configs: [], needsConfig: true, isFirstLogin: profile?.is_first_login || false };
    }

    // Déterminer si une configuration est nécessaire
    const hasConfigured = configs.some(config => config.status === "configured");
    
    return {
      profile,
      configs,
      needsConfig: !hasConfigured,
      isFirstLogin: profile?.is_first_login || false
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return { profile: null, configs: [], needsConfig: true, isFirstLogin: false, error };
  }
};

/**
 * Gère la redirection des utilisateurs en fonction de leur état
 */
export const handleUserRedirection = (
  isAuthPage: boolean,
  needsConfig: boolean,
  isFirstLogin: boolean,
  navigationHelpers: {
    navigate: any;
    location: any;
    getUrlParams: () => { mode: string; client: boolean; forceCloud: boolean };
    getNavigationPath: (path: string) => string;
  }
) => {
  // Ne pas rediriger si l'utilisateur n'est pas sur une page d'authentification
  if (!isAuthPage) return;

  const { navigate, getNavigationPath } = navigationHelpers;

  // Rediriger les utilisateurs qui ont besoin de configuration ou qui se connectent pour la première fois
  if (needsConfig || isFirstLogin) {
    navigate(getNavigationPath("/config"));
    return;
  }

  // Rediriger les utilisateurs déjà configurés vers le chat
  navigate(getNavigationPath("/chat"));
};

/**
 * Vérifie la protection des routes et redirige si nécessaire
 */
export const checkRouteProtection = (
  session: any,
  isPublicPage: boolean,
  isProtectedPage: boolean,
  navigationHelpers: {
    navigate: any;
    location: any;
    getUrlParams: () => { mode: string; client: boolean; forceCloud: boolean };
    getNavigationPath: (path: string) => string;
  }
) => {
  const { navigate, getNavigationPath } = navigationHelpers;

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une page protégée
  if (!session?.user && isProtectedPage) {
    navigate(getNavigationPath("/auth"), { replace: true });
    return true;
  }

  return false;
};

/**
 * Vérifie si un chemin correspond à une page publique
 */
export const isPublicPagePath = (pathname: string): boolean => {
  const publicPaths = ["/", "/landing", "/home", "/index"];
  return publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`));
};

/**
 * Vérifie si un chemin correspond à une page d'authentification
 */
export const isAuthPagePath = (pathname: string): boolean => {
  return pathname === "/auth" || pathname.startsWith("/auth/");
};
