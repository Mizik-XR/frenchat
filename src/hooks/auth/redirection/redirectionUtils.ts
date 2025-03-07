
import { NavigationHelpers } from "../types";

/**
 * Gère la redirection des utilisateurs en fonction de leur état
 */
export const handleUserRedirection = (
  isAuthPage: boolean,
  needsConfig: boolean,
  isFirstLogin: boolean,
  navigationHelpers: NavigationHelpers
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
  navigationHelpers: NavigationHelpers
) => {
  const { navigate, getNavigationPath } = navigationHelpers;

  // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une page protégée
  if (!session?.user && isProtectedPage) {
    navigate(getNavigationPath("/auth"), { replace: true });
    return true;
  }

  return false;
};
