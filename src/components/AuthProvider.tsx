
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, "session:", session);
      
      if (_event === 'SIGNED_IN') {
        setUser(session?.user ?? null);
        setIsLoading(false);
        navigate('/config');
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

      // Ne redirigez vers /auth que si nous ne sommes pas déjà sur /auth
      if (!session?.user && location.pathname !== "/auth" && !isFirstLoad) {
        console.log("No user found, redirecting to /auth");
        navigate("/auth");
      }
    });

    // Vérification initiale de la session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      isFirstLoad = false;

      if (!session?.user && location.pathname !== "/auth") {
        console.log("No initial session, redirecting to /auth");
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt !",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  console.log("AuthProvider rendering, user:", user, "isLoading:", isLoading);

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
