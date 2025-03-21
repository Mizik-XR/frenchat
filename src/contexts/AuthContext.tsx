
import React, { createContext, useContext, useState } from 'react';

type AuthContextType = {
  user: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
};

const defaultContext: AuthContextType = {
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  isLoading: false,
};

const AuthContext = createContext<AuthContextType>(defaultContext);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    // Implémentation minimaliste
  };

  const signOut = async () => {
    // Implémentation minimaliste
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
