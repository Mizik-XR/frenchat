
import { useState, useEffect, useCallback } from "react";
import { supabase, preloadSession } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// Liste des routes protégées qui nécessitent une authentification
export const PROTECTED_ROUTES = ['/chat', '/config', '/documents', '/monitoring', '/ai-config', '/home'];

// Optimiser la vérification initiale des sessions avec un cache mémoire
let cachedUser: User | null = null;
let isSessionLoading = true;

export function useAuthSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(cachedUser);
  const [isLoading, setIsLoading] = useState(isSessionLoading);

  // Fonction pour vérifier le profil utilisateur et les configurations
  const checkUserAndConfig = useCallback(async (session: any) => {
    if (!session?.user) return null;
    
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

      return { profile, configs };
    } catch (error) {
      console.error("Erreur lors de la vérification de l'utilisateur:", error);
      return null;
    }
  }, []);

  // Gérer les changements d'état d'authentification
  const handleAuthChange = useCallback(async (_event: string, session: any) => {
    console.log("Auth state changed:", _event, "session:", session?.user?.id ? "User authenticated" : "No user");
    
    // Mettre à jour le cache global
    cachedUser = session?.user ?? null;
    setUser(cachedUser);
    
    // Vérifier si l'utilisateur tente d'accéder à une route protégée sans être authentifié
    if (!session?.user && PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
      navigate('/auth', { state: { from: location } });
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour accéder à cette page.",
        variant: "destructive"
      });
      isSessionLoading = false;
      setIsLoading(false);
      return;
    }
    
    if (_event === 'SIGNED_IN') {
      const result = await checkUserAndConfig(session);
      
      if (result) {
        const { profile, configs } = result;
        const hasAllConfigs = configs?.some(c => c.status === 'configured');
        const needsConfiguration = !configs?.length || !hasAllConfigs;

        if (profile?.is_first_login || needsConfiguration) {
          if (location.pathname !== '/config') {
            navigate('/config');
            toast({
              title: "Configuration requise",
              description: "Configurons votre espace de travail.",
            });
          }
        } else if (location.pathname === '/auth' || location.pathname === '/') {
          navigate('/home');
        }
      }
      
      isSessionLoading = false;
      setIsLoading(false);
      return;
    }

    if (_event === 'SIGNED_OUT') {
      isSessionLoading = false;
      setIsLoading(false);
      if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
        navigate('/');
      }
      return;
    }

    isSessionLoading = false;
    setIsLoading(false);
  }, [navigate, location, checkUserAndConfig]);

  // Fonction de vérification initiale de la session avec optimisation
  const checkSession = useCallback(async () => {
    try {
      console.log("Checking initial session...");
      // Utiliser la session préchargée
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Initial session check:", session?.user?.id ? "User authenticated" : "No user");
      
      if (session?.user) {
        // Mettre à jour le cache global
        cachedUser = session.user;
        setUser(cachedUser);
        
        const result = await checkUserAndConfig(session);
        
        if (result) {
          const { profile, configs } = result;
          const hasAllConfigs = configs?.some(c => c.status === 'configured');
          const needsConfiguration = !configs?.length || !hasAllConfigs;

          // Réparation d'une erreur potentielle: si l'utilisateur est sur la page auth mais est
          // déjà connecté, rediriger vers la configuration ou home
          if ((profile?.is_first_login || needsConfiguration) && location.pathname !== '/config') {
            navigate('/config');
          } else if ((location.pathname === '/' || location.pathname === '/auth') && 
                     !location.pathname.startsWith('/auth/google')) {
            navigate('/home');
          }
        }
      } else if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
        // Rediriger si l'utilisateur tente d'accéder à une route protégée sans être authentifié
        navigate('/auth', { state: { from: location } });
        toast({
          title: "Authentification requise",
          description: "Veuillez vous connecter pour accéder à cette page.",
          variant: "destructive"
        });
      }
      
      // Mettre à jour l'état de chargement global
      isSessionLoading = false;
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la vérification de la session:", error);
      cachedUser = null;
      setUser(null);
      isSessionLoading = false;
      setIsLoading(false);
      
      // Rediriger vers l'accueil en cas d'erreur, au lieu de la page d'authentification
      if (location.pathname !== '/' && location.pathname !== '/auth') {
        navigate('/');
      }
    }
  }, [navigate, location.pathname, checkUserAndConfig]);

  // Fonction de déconnexion
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      cachedUser = null;
      setUser(null);
      navigate("/");
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [navigate]);

  // Configurer le listener d'authentification avec optimisation de performance
  useEffect(() => {
    // Précharger la session si ce n'est pas déjà fait
    if (isSessionLoading) {
      preloadSession();
    }
    
    // Mettre en place le listener d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    
    // Vérifier la session initiale uniquement si nécessaire
    if (isSessionLoading) {
      checkSession();
    }

    // Nettoyer le listener à la désinscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname, handleAuthChange, checkSession]);

  return { user, isLoading, signOut };
}
