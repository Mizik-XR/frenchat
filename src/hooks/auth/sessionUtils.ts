
import { useNavigate, useLocation } from 'react-router-dom';
import { preloadSession } from '@/integrations/supabase/client';
import { supabase } from '@/integrations/supabase/client';
import { updateCachedUser, updateSessionLoading, PROTECTED_ROUTES, needsConfiguration, checkUserAndConfig } from './authConstants';
import { toast } from '@/hooks/use-toast';

// Précharger la session au démarrage
export const preloadUserSession = async () => {
  try {
    const { session } = await preloadSession();
    return session;
  } catch (error) {
    console.error("Erreur lors du préchargement de la session:", error);
    return null;
  }
};

// Vérifier si l'utilisateur est authentifié et gérer la redirection
export const checkAuthentication = (
  user: any, 
  pathname: string, 
  navigate: ReturnType<typeof useNavigate>
) => {
  updateCachedUser(user);
  
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (!user && isProtectedRoute) {
    toast({
      title: "Accès non autorisé",
      description: "Veuillez vous connecter pour accéder à cette page.",
      variant: "destructive"
    });
    
    navigate('/auth');
  }
  
  updateSessionLoading(false);
};

// Déconnexion de l'utilisateur
export const handleSignOut = async (navigate: ReturnType<typeof useNavigate>) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    updateCachedUser(null);
    navigate('/');
    
    // Vérifier si nous sommes sur une route protégée
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      window.location.pathname.startsWith(route)
    );
    
    if (isProtectedRoute) {
      toast({
        title: "Déconnecté",
        description: "Vous avez été déconnecté avec succès.",
      });
      navigate('/auth');
    }
    
    updateSessionLoading(false);
    return true;
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    return false;
  }
};

// Vérifier l'état de l'utilisateur et les besoins de configuration
export const checkUserStatus = async (user: any, pathname: string) => {
  const { needsConfig } = checkUserAndConfig(user);
  
  if (user && needsConfig && !pathname.startsWith('/config')) {
    toast({
      title: "Configuration requise",
      description: "Veuillez compléter la configuration de votre compte.",
    });
    return '/config';
  }
  
  // Vérifier si l'utilisateur est sur une route protégée sans être authentifié
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (!user && isProtectedRoute) {
    return '/auth';
  }
  
  updateSessionLoading(false);
  return null;
};

export default {
  preloadUserSession,
  checkAuthentication,
  handleSignOut,
  checkUserStatus
};
