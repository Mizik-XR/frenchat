
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
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    const handleAuthChange = async (_event: string, session: any) => {
      console.log("Auth state changed:", _event, "session:", session?.user?.id ? "User authenticated" : "No user");
      
      setUser(session?.user ?? null);
      
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
            navigate('/chat');
          }
        }
        
        setIsLoading(false);
        return;
      }

      if (_event === 'SIGNED_OUT') {
        setIsLoading(false);
        navigate('/auth');
        return;
      }

      setIsLoading(false);
    };

    // Vérification initiale de la session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Initial session check:", session?.user?.id ? "User authenticated" : "No user");
        
        if (session?.user) {
          setUser(session.user);
          
          const result = await checkUserAndConfig(session);
          
          if (result) {
            const { profile, configs } = result;
            const hasAllConfigs = configs?.some(c => c.status === 'configured');
            const needsConfiguration = !configs?.length || !hasAllConfigs;

            if ((profile?.is_first_login || needsConfiguration) && location.pathname !== '/config') {
              navigate('/config');
            } else if (location.pathname === '/' || location.pathname === '/auth') {
              navigate('/chat');
            }
          }
        } else if (location.pathname !== '/auth' && location.pathname !== '/') {
          navigate('/auth');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de la vérification de la session:", error);
        setUser(null);
        setIsLoading(false);
        navigate('/auth');
      }
    };

    // Mettre en place le listener d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    
    // Vérifier la session initiale
    checkSession();

    // Nettoyer le listener à la désinscription
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
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
