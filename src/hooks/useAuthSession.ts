
import { useState, useEffect, useCallback } from "react";
import { supabase, handleProfileQuery, APP_STATE } from "@/integrations/supabase/client";
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
import { toast } from "@/hooks/use-toast";

export function useAuthSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(isSessionLoading);
  const [offlineMode, setOfflineMode] = useState(APP_STATE.isOfflineMode);
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

  // Gérer le mode hors ligne
  useEffect(() => {
    const handleOfflineChange = () => {
      setOfflineMode(APP_STATE.isOfflineMode);
    };
    
    window.addEventListener('storage', (e) => {
      if (e.key === 'OFFLINE_MODE') {
        handleOfflineChange();
      }
    });
    
    return () => {
      window.removeEventListener('storage', handleOfflineChange);
    };
  }, []);

  const handleAuthChange = useCallback(async (_event: string, session: any) => {
    console.log("Auth state changed:", _event, "session:", session?.user?.id ? "User authenticated" : "No user");
    
    // Si on est en mode hors ligne, pas besoin de vérifier la session
    if (APP_STATE.isOfflineMode) {
      updateCachedUser(null);
      setUser(null);
      updateSessionLoading(false);
      setIsLoading(false);
      return;
    }
    
    updateCachedUser(session?.user ?? null);
    setUser(session?.user ?? null);
    
    // Déterminer si nous sommes sur une page publique pour éviter les redirections inutiles
    const isPublicPage = 
      location.pathname === '/' || 
      location.pathname === '/landing' || 
      location.pathname.startsWith('/landing') ||
      location.pathname === '/home' || 
      location.pathname === '/index';
    
    const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/auth/');
    
    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
    if (!session?.user && PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
      console.log("Redirection vers auth depuis route protégée:", location.pathname);
      navigate(getNavigationPath('/auth'), { state: { from: location.pathname } });
      updateSessionLoading(false);
      setIsLoading(false);
      return;
    }
    
    if (_event === 'SIGNED_IN') {
      try {
        // Vérifier si le profil existe et le créer si nécessaire
        const { data: profile, error: profileError } = await handleProfileQuery(session.user.id);
          
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
          // En cas d'erreur, rediriger vers le chat par défaut
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
    // Si on est en mode hors ligne, pas besoin de vérifier la session
    if (APP_STATE.isOfflineMode) {
      console.log("Mode hors ligne actif, pas de vérification de session");
      updateCachedUser(null);
      setUser(null);
      updateSessionLoading(false);
      setIsLoading(false);
      
      // Si on est sur une route protégée, rediriger vers la page d'accueil
      if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
        navigate(getNavigationPath('/'));
      }
      
      return;
    }
    
    try {
      console.log("Checking initial session...");
      
      if (!supabase) {
        throw new Error("Client Supabase non disponible");
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Initial session check:", session?.user?.id ? "User authenticated" : "No user");
      
      // Déterminer si nous sommes sur une page publique
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
          // Vérifier si le profil existe et le créer si nécessaire
          const { data: profile, error: profileError } = await handleProfileQuery(session.user.id);
            
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
      
      // Si l'erreur est liée à la connectivité, activer le mode hors ligne
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') || 
        error.message.includes('Network request failed')
      )) {
        APP_STATE.setOfflineMode(true);
        setOfflineMode(true);
      }
    } finally {
      updateSessionLoading(false);
      setIsLoading(false);
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(handleAuthChange);
      subscription = data.subscription;
    }
    
    checkSession();
    
    return () => {
      subscription?.unsubscribe();
    };
  }, [handleAuthChange, checkSession]);

  // Fonction pour basculer manuellement le mode hors ligne
  const toggleOfflineMode = (value?: boolean) => {
    const newValue = value !== undefined ? value : !APP_STATE.isOfflineMode;
    APP_STATE.setOfflineMode(newValue);
    setOfflineMode(newValue);
  };

  return { 
    user, 
    isLoading, 
    signOut,
    isOfflineMode: offlineMode,
    toggleOfflineMode
  };
}

export { PROTECTED_ROUTES };
