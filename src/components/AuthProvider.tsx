
import { React, createSafeContext } from "@/core/ReactInstance";
import { User } from "@supabase/supabase-js";
import { useAuthSession } from "@/hooks/useAuthSession";
import { LoadingScreen } from "@/components/auth/LoadingScreen";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: true,
  signOut: async () => {},
};

// Création du contexte avec l'API simplifiée
const { Context: AuthContext, useContext: useAuth } = createSafeContext<AuthContextType>(
  defaultAuthContext, 
  "AuthContext"
);

// Export direct du hook
export { useAuth };

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
