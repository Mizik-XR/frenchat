
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
    
    const urlParams = getUrlParams();
    
    if (!session?.user && PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
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

        if ((isFirstLogin || needsConfig) && location.pathname === '/auth') {
          console.log("Redirection vers la configuration (nouveau compte ou configuration requise)");
          navigate(getNavigationPath('/config'));
        } else if (location.pathname === '/auth' || location.pathname === '/index') {
          console.log("Redirection vers la page d'accueil (utilisateur déjà configuré)");
          navigate(getNavigationPath('/home'));
        }
      } catch (error) {
        console.error("Erreur lors de la vérification du statut d'utilisateur:", error);
        if (location.pathname === '/auth') {
          navigate(getNavigationPath('/home'));
        }
      }
    } else if (_event === 'SIGNED_OUT') {
      if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
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

          // Modifier la condition pour ne pas rediriger automatiquement depuis la page d'accueil
          if ((isFirstLogin || needsConfig) && 
              location.pathname === '/auth' &&
              !location.pathname.startsWith('/auth/google')) {
            console.log("Redirection vers configuration (vérification initiale)");
            navigate(getNavigationPath('/config'));
          } else if (location.pathname === '/auth' && 
                    !location.pathname.startsWith('/auth/google')) {
            console.log("Redirection vers home (vérification initiale)");
            navigate(getNavigationPath('/home'));
          }
          // Ne pas rediriger automatiquement si l'utilisateur est sur la page d'accueil
        } catch (error) {
          console.error("Erreur lors de la vérification du statut d'utilisateur (session initiale):", error);
        }
      } else if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
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
