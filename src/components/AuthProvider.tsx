
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let isFirstLoad = true;

    // Configurer l'écouteur d'événements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, "session:", session);
      
      if (_event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        setIsLoading(false);
        
        // Vérification immédiate après la connexion
        if (session?.user) {
          // Vérifier si l'utilisateur est nouveau
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_first_login')
            .eq('id', session.user.id)
            .single();

          // Vérifier les configurations nécessaires
          const { data: configs, error: configError } = await supabase
            .from('service_configurations')
            .select('service_type, status')
            .in('service_type', ['google_drive', 'microsoft_teams', 'llm']);

          console.log("User configs:", configs);
          console.log("Config error:", configError);

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
            navigate('/chat');
          }
        }
        return;
      }

      if (_event === 'SIGNED_OUT') {
        setUser(null);
        setIsLoading(false);
        navigate('/auth');
        return;
      }

      setUser(session?.user ?? null);
      setIsLoading(false);

      if (!session?.user && !isFirstLoad && location.pathname !== '/auth') {
        navigate("/auth");
      }
    });

    // Vérification initiale de la session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("Initial session check:", session);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_first_login')
          .eq('id', session.user.id)
          .single();

        const { data: configs } = await supabase
          .from('service_configurations')
          .select('service_type, status')
          .in('service_type', ['google_drive', 'microsoft_teams', 'llm']);

        setUser(session.user);
        setIsLoading(false);
        isFirstLoad = false;

        const hasAllConfigs = configs?.some(c => c.status === 'configured');
        const needsConfiguration = !configs?.length || !hasAllConfigs;

        if ((profile?.is_first_login || needsConfiguration) && location.pathname !== '/config') {
          navigate('/config');
        } else if (location.pathname === '/' || location.pathname === '/auth') {
          navigate('/chat');
        }
      } else {
        setUser(null);
        setIsLoading(false);
        isFirstLoad = false;
        
        if (location.pathname !== '/auth') {
          navigate('/auth');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);

  const signOut = async () => {
    try {
      // Supprimer toutes les données de session
      await supabase.auth.signOut();
      
      // Forcer la suppression du token de session
      await supabase.auth.setSession({
        access_token: '',
        refresh_token: ''
      });
      
      // Effacer les données locales et rediriger
      setUser(null);
      navigate("/auth");
      
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

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
