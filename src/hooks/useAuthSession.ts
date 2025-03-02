
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

export function useAuthSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(isSessionLoading);
  const signOut = useSignOut();

  // Gérer les changements d'état d'authentification
  const handleAuthChange = useCallback(async (_event: string, session: any) => {
    console.log("Auth state changed:", _event, "session:", session?.user?.id ? "User authenticated" : "No user");
    
    // Mettre à jour le cache global
    updateCachedUser(session?.user ?? null);
    setUser(session?.user ?? null);
    
    // Vérifier si l'utilisateur tente d'accéder à une route protégée sans être authentifié
    if (!session?.user && PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
      // Rediriger vers la page d'authentification avec l'origine stockée
      navigate('/auth', { state: { from: location.pathname } });
      updateSessionLoading(false);
      setIsLoading(false);
      return;
    }
    
    if (_event === 'SIGNED_IN') {
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

      // Redirection basée sur le statut de l'utilisateur
      if (profile?.is_first_login || needsConfig) {
        if (location.pathname !== '/config') {
          navigate('/config');
        }
      } else if (location.pathname === '/auth' || location.pathname === '/' || location.pathname === '/index') {
        navigate('/home');
      }
    } else if (_event === 'SIGNED_OUT') {
      // Rediriger vers la page d'accueil si l'utilisateur est déconnecté sur une page protégée
      if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
        navigate('/');
      }
    }

    updateSessionLoading(false);
    setIsLoading(false);
  }, [navigate, location.pathname]);

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

        // Redirection selon l'état de l'utilisateur
        if ((profile?.is_first_login || needsConfig) && location.pathname !== '/config') {
          navigate('/config');
        } else if ((location.pathname === '/' || location.pathname === '/auth' || location.pathname === '/index') && 
                  !location.pathname.startsWith('/auth/google')) {
          navigate('/home');
        }
      } else if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
        // Rediriger si l'utilisateur tente d'accéder à une route protégée sans être authentifié
        navigate('/auth', { state: { from: location.pathname } });
      }
      
      // Mettre à jour l'état de chargement global
      updateSessionLoading(false);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la vérification de la session:", error);
      updateCachedUser(null);
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
