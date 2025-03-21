import { supabase, preloadSession } from '@/integrations/supabase/client';

export const getAuthenticatedUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error("Error getting authenticated user:", error);
    return null;
  }
};

export const checkCurrentSession = async () => {
  try {
    const session = await preloadSession();
    return session?.user || null;
  } catch (error) {
    console.error("Error checking current session:", error);
    return null;
  }
};

export async function checkInitialSession(navigate: ReturnType<typeof useNavigate>, pathname: string) {
  try {
    console.log("Checking initial session...");
    const { data: { session } } = await supabase.auth.getSession();
    console.log("Initial session check:", session?.user?.id ? "User authenticated" : "No user");
    
    if (session?.user) {
      // Mettre à jour le cache global
      updateCachedUser(session.user);
      
      const result = await checkUserAndConfig(session);
      
      if (result) {
        const { profile, configs } = result;
        const needsConfig = needsConfiguration(configs);

        // Redirection selon l'état de l'utilisateur
        if ((profile?.is_first_login || needsConfig) && pathname !== '/config') {
          navigate('/config');
        } else if ((pathname === '/' || pathname === '/auth' || pathname === '/index') && 
                  !pathname.startsWith('/auth/google')) {
          navigate('/home');
        }
      }
    } else if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      // Rediriger si l'utilisateur tente d'accéder à une route protégée sans être authentifié
      navigate('/auth', { state: { from: { pathname } } });
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour accéder à cette page.",
        variant: "destructive"
      });
    }
    
    // Mettre à jour l'état de chargement global
    updateSessionLoading(false);
  } catch (error) {
    console.error("Erreur lors de la vérification de la session:", error);
    updateCachedUser(null);
    updateSessionLoading(false);
  }
}

// Fonction pour gérer les changements d'état d'authentification
export async function handleAuthChange(
  event: string, 
  session: any, 
  navigate: ReturnType<typeof useNavigate>, 
  pathname: string,
  setUser: (user: any) => void,
  setIsLoading: (loading: boolean) => void
) {
  console.log("Auth state changed:", event, "session:", session?.user?.id ? "User authenticated" : "No user");
  
  // Mettre à jour le cache global
  updateCachedUser(session?.user ?? null);
  setUser(session?.user ?? null);
  
  // Vérifier si l'utilisateur tente d'accéder à une route protégée sans être authentifié
  if (!session?.user && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    navigate('/auth', { state: { from: { pathname } } });
    toast({
      title: "Authentification requise",
      description: "Veuillez vous connecter pour accéder à cette page.",
      variant: "destructive"
    });
    updateSessionLoading(false);
    setIsLoading(false);
    return;
  }
  
  if (event === 'SIGNED_IN') {
    const result = await checkUserAndConfig(session);
    
    if (result) {
      const { profile, configs } = result;
      const needsConfig = needsConfiguration(configs);

      if (profile?.is_first_login || needsConfig) {
        if (pathname !== '/config') {
          navigate('/config');
          toast({
            title: "Configuration requise",
            description: "Configurons votre espace de travail.",
          });
        }
      } else if (pathname === '/auth' || pathname === '/' || pathname === '/index') {
        navigate('/home');
      }
    }
  } else if (event === 'SIGNED_OUT') {
    if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
      navigate('/');
    }
  }

  updateSessionLoading(false);
  setIsLoading(false);
}

// Fonction pour précharger la session
export function preloadAuthSession() {
  if (typeof window !== 'undefined') {
    setTimeout(preloadSession, 0);
  }
}
