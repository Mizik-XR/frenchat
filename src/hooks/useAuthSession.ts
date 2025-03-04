
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  cachedUser, 
  isSessionLoading, 
  PROTECTED_ROUTES,
  updateCachedUser,
  updateSessionLoading
} from "./auth/authConstants";
import { useSignOut } from "./auth/authActions";
import { getFormattedUrlParams } from "@/utils/environmentUtils";

export function useAuthSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(isSessionLoading);
  const signOut = useSignOut();

  // Récupérer les paramètres de l'URL
  const getUrlParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      mode: searchParams.get('mode'),
      client: searchParams.get('client') === 'true',
      forceCloud: searchParams.get('forceCloud') === 'true',
    };
  };

  // Conserver les paramètres d'URL lors des redirections
  const getNavigationPath = (path: string) => {
    const persistedParams = getFormattedUrlParams();
    return `${path}${persistedParams}`;
  };

  // Gérer les changements d'état d'authentification
  const handleAuthChange = useCallback(async (_event: string, session: any) => {
    console.log("Auth state changed:", _event, "session:", session?.user?.id ? "User authenticated" : "No user");
    
    // Mettre à jour le cache global
    updateCachedUser(session?.user ?? null);
    setUser(session?.user ?? null);
    
    const urlParams = getUrlParams();
    
    // Vérifier si l'utilisateur tente d'accéder à une route protégée sans être authentifié
    if (!session?.user && PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
      // Rediriger vers la page d'authentification avec l'origine stockée
      navigate(getNavigationPath('/auth'), { state: { from: location.pathname } });
      updateSessionLoading(false);
      setIsLoading(false);
      return;
    }
    
    if (_event === 'SIGNED_IN') {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_first_login')
          .eq('id', session.user.id)
          .single();
          
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Erreur lors de la récupération du profil:", profileError);
        }

        const { data: configs, error: configError } = await supabase
          .from('service_configurations')
          .select('service_type, status')
          .in('service_type', ['google_drive', 'microsoft_teams', 'llm']);

        if (configError) {
          console.error("Erreur lors de la récupération des configurations:", configError);
        }

        const needsConfig = !configs || !configs.length || !configs.some(c => c.status === 'configured');
        const isFirstLogin = profile?.is_first_login;

        // Redirection basée sur le statut de l'utilisateur
        if (isFirstLogin || needsConfig) {
          if (location.pathname !== '/config') {
            console.log("Redirection vers la configuration (nouveau compte ou configuration requise)");
            navigate(getNavigationPath('/config'));
          }
        } else if (location.pathname === '/auth' || location.pathname === '/' || location.pathname === '/index') {
          console.log("Redirection vers la page d'accueil (utilisateur déjà configuré)");
          navigate(getNavigationPath('/home'));
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut d'utilisateur:", error);
        // En cas d'erreur, naviguer vers la page d'accueil par défaut
        if (location.pathname === '/auth') {
          navigate(getNavigationPath('/home'));
        }
      }
    } else if (_event === 'SIGNED_OUT') {
      // Rediriger vers la page d'accueil si l'utilisateur est déconnecté sur une page protégée
      if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
        navigate(getNavigationPath('/'));
      }
    }

    updateSessionLoading(false);
    setIsLoading(false);
  }, [navigate, location.pathname, location.search]);

  // Fonction de vérification initiale de la session
  const checkSession = useCallback(async () => {
    try {
      console.log("Checking initial session...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Initial session check:", session?.user?.id ? "User authenticated" : "No user");
      
      if (session?.user) {
        // Mettre à jour le cache global
        updateCachedUser(session.user);
        setUser(session.user);
        
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('is_first_login')
            .eq('id', session.user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            console.error("Erreur lors de la récupération du profil:", profileError);
          }

          const { data: configs, error: configError } = await supabase
            .from('service_configurations')
            .select('service_type, status')
            .in('service_type', ['google_drive', 'microsoft_teams', 'llm']);

          if (configError) {
            console.error("Erreur lors de la récupération des configurations:", configError);
          }

          const needsConfig = !configs || !configs.length || !configs.some(c => c.status === 'configured');
          const isFirstLogin = profile?.is_first_login;

          // Redirection selon l'état de l'utilisateur
          if ((isFirstLogin || needsConfig) && location.pathname !== '/config') {
            console.log("Redirection vers configuration (vérification initiale)");
            navigate(getNavigationPath('/config'));
          } else if ((location.pathname === '/' || location.pathname === '/auth' || location.pathname === '/index') && 
                    !location.pathname.startsWith('/auth/google')) {
            console.log("Redirection vers home (vérification initiale)");
            navigate(getNavigationPath('/home'));
          }
        } catch (error) {
          console.error("Erreur lors de la vérification du statut d'utilisateur (session initiale):", error);
          // En cas d'erreur, ne pas bloquer l'interface
        }
      } else if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
        // Rediriger si l'utilisateur tente d'accéder à une route protégée sans être authentifié
        navigate(getNavigationPath('/auth'), { state: { from: location.pathname } });
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la session:", error);
      updateCachedUser(null);
    } finally {
      // Toujours mettre à jour l'état de chargement global, même en cas d'erreur
      updateSessionLoading(false);
      setIsLoading(false);
    }
  }, [navigate, location.pathname]);

  // Configurer le listener d'authentification
  useEffect(() => {
    // Mettre en place le listener d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    
    // Vérifier la session initiale au premier rendu
    checkSession();
    
    // Nettoyer le listener à la désinscription
    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthChange, checkSession]);

  return { user, isLoading, signOut };
}

// Réexporter les constantes pour usage externe
export { PROTECTED_ROUTES };
