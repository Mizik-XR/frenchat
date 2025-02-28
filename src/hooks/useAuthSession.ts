
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

// Liste des routes protégées qui nécessitent une authentification
export const PROTECTED_ROUTES = ['/chat', '/config', '/documents', '/monitoring', '/ai-config', '/home'];

export function useAuthSession() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fonction pour vérifier le profil utilisateur et les configurations
  const checkUserAndConfig = async (session: any) => {
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
  };

  // Gérer les changements d'état d'authentification
  const handleAuthChange = async (_event: string, session: any) => {
    console.log("Auth state changed:", _event, "session:", session?.user?.id ? "User authenticated" : "No user");
    
    setUser(session?.user ?? null);
    
    // Vérifier si l'utilisateur tente d'accéder à une route protégée sans être authentifié
    if (!session?.user && PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
      navigate('/auth', { state: { from: location } });
      toast({
        title: "Authentification requise",
        description: "Veuillez vous connecter pour accéder à cette page.",
        variant: "destructive"
      });
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
      
      setIsLoading(false);
      return;
    }

    if (_event === 'SIGNED_OUT') {
      setIsLoading(false);
      if (PROTECTED_ROUTES.some(route => location.pathname.startsWith(route))) {
        navigate('/');
      }
      return;
    }

    setIsLoading(false);
  };

  // Fonction de vérification initiale de la session
  const checkSession = async () => {
    try {
      console.log("Checking initial session...");
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Initial session check:", session?.user?.id ? "User authenticated" : "No user");
      
      if (session?.user) {
        setUser(session.user);
        
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
      
      // Fixer le problème de chargement sans fin
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la vérification de la session:", error);
      setUser(null);
      setIsLoading(false);
      
      // Rediriger vers l'accueil en cas d'erreur, au lieu de la page d'authentification
      if (location.pathname !== '/' && location.pathname !== '/auth') {
        navigate('/');
      }
    }
  };

  // Fonction de déconnexion
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
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
  };

  // Configurer le listener d'authentification
  useEffect(() => {
    // Mettre en place le listener d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    
    // Vérifier la session initiale
    checkSession();

    // Nettoyer le listener à la désinscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return { user, isLoading, signOut };
}
