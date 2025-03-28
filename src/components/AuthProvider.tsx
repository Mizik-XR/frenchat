import { React } from "@/core/ReactInstance";
import { User } from "@supabase/supabase-js";
import { useAuthSession } from "@/hooks/useAuthSession";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { createContextSafely, getContextValue } from "@/utils/react/createContextSafely";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

// Création du contexte avec la nouvelle API
const { Context: AuthContext, useContext: useAuthContext } = createContextSafely<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
}, "AuthContext");

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
    const context = useAuthContext();
    if (!context) {
      console.error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
      return {
        user: null,
        isLoading: true,
        signOut: async () => {},
      };
    }
    return context;
  } catch (error) {
    console.error("Erreur lors de l'utilisation du contexte Auth:", error);
    return getContextValue(AuthContext, {
      user: null,
      isLoading: true,
      signOut: async () => {},
    });
  }
};
