
import { createContext, useContext } from "react";
import { User } from "@supabase/supabase-js";
import { useAuthSession } from "@/hooks/useAuthSession";
import { LoadingScreen } from "@/components/auth/LoadingScreen";

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
  const { user, isLoading, signOut } = useAuthSession();

  // Display loading component while checking authentication
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
};
