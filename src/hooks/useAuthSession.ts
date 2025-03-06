
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
import { getFormattedUrlParams } from "@/utils/environment";

export function useAuthSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(isSessionLoading);
  const signOut = useSignOut();

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

  const handleAuthChange = useCallback(async (_event: string, session: any) => {
    console.log("Auth state changed:", _event, "session:", session?.user?.id ? "User authenticated" : "No user");
    
    updateCachedUser(session?.user ?? null);
    setUser(session?.user ?? null);
    
    // Ne pas rediriger si nous sommes sur la page d'accueil, la landing page ou certaines routes publiques
    const isPublicPage = 
      location.pathname === '/' || 
      location.pathname === '/landing' || 
      location.pathname.startsWith('/landing') ||
      location.pathname === '/home' || 
      location.pathname === '/index';
    
    const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/auth/');
    
    if (!session?.user && PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
      console.log("Redirection vers auth depuis route protégée:", location.pathname);
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

        // Rediriger vers la configuration ou le chat selon la situation
        if (isAuthPage) {
          if (isFirstLogin || needsConfig) {
            console.log("Redirection vers la configuration (nouveau compte ou configuration requise)");
            navigate(getNavigationPath('/config'));
          } else {
            console.log("Redirection vers le chat (utilisateur déjà configuré)");
            navigate(getNavigationPath('/chat'));
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut d'utilisateur:", error);
        if (isAuthPage) {
          navigate(getNavigationPath('/chat'));
        }
      }
    } else if (_event === 'SIGNED_OUT') {
      // Ne pas rediriger si nous sommes sur une page publique
      if (!isPublicPage && PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
        navigate(getNavigationPath('/'));
      }
    }

    updateSessionLoading(false);
    setIsLoading(false);
  }, [navigate, location.pathname, location.search]);

  const checkSession = useCallback(async () => {
    try {
      console.log("Checking initial session...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Initial session check:", session?.user?.id ? "User authenticated" : "No user");
      
      // Ne pas rediriger si nous sommes sur la page d'accueil, la landing page ou certaines routes publiques
      const isPublicPage = 
        location.pathname === '/' || 
        location.pathname === '/landing' || 
        location.pathname.startsWith('/landing') ||
        location.pathname === '/home' || 
        location.pathname === '/index';
      
      const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/auth/');
      
      if (session?.user) {
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

          // Rediriger vers la configuration ou le chat selon la situation pour les pages d'auth
          if (isAuthPage) {
            if (isFirstLogin || needsConfig) {
              console.log("Redirection vers configuration (vérification initiale)");
              navigate(getNavigationPath('/config'));
            } else {
              console.log("Redirection vers chat (vérification initiale)");
              navigate(getNavigationPath('/chat'));
            }
          }
          // Ne jamais rediriger automatiquement depuis les pages publiques
        } catch (error) {
          console.error("Erreur lors de la vérification du statut d'utilisateur (session initiale):", error);
        }
      } else if (!isPublicPage && PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
        navigate(getNavigationPath('/auth'), { state: { from: location.pathname } });
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la session:", error);
      updateCachedUser(null);
    } finally {
      updateSessionLoading(false);
      setIsLoading(false);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthChange, checkSession]);

  return { user, isLoading, signOut };
}

export { PROTECTED_ROUTES };
