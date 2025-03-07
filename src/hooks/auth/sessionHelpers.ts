
// Ce fichier exporte les fonctions depuis les modules spécialisés
// pour maintenir la compatibilité avec le code existant

export { useNavigationHelpers } from './navigation/navigationHelpers';
export { handleProfileAndConfig } from './profile/profileUtils';
export { handleUserRedirection, checkRouteProtection } from './redirection/redirectionUtils';
export { isPublicPagePath, isAuthPagePath } from './routes/routeHelpers';
