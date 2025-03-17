
import { useContext } from "react";
import { User } from "@supabase/supabase-js";
import { useAuthSession } from "@/hooks/useAuthSession";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { createContextSafely, getContextValue } from "@/utils/react/createContextSafely";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContextSafely<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, signOut } = useAuthSession();

  // Afficher le composant de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  try {
    const context = useContext(AuthContext);
    if (!context) {
      console.error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
      return getContextValue(AuthContext);
    }
    return context;
  } catch (error) {
    console.error("Erreur lors de l'utilisation du contexte Auth:", error);
    return getContextValue(AuthContext);
  }
};
