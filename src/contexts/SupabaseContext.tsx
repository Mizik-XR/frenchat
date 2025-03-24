/**
 * Contexte Supabase
 * 
 * Ce module fournit un contexte React pour accéder aux services Supabase
 * et à l'état de l'application de manière globale.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabase';
import { appState } from '@/core/AppState';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/services/supabase';

// Types pour le contexte
interface SupabaseContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<User | null>;
  signUp: (email: string, password: string) => Promise<User | null>;
  signOut: () => Promise<void>;
  query: <T extends keyof Database['public']['Tables']>(
    table: T,
    options?: {
      select?: string;
      eq?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
    }
  ) => Promise<Database['public']['Tables'][T]['Row'][]>;
  uploadFile: (bucket: string, path: string, file: File) => Promise<any>;
  downloadFile: (bucket: string, path: string) => Promise<any>;
  listFiles: (bucket: string, path: string) => Promise<any>;
}

// Création du contexte
const SupabaseContext = createContext<SupabaseContextType | null>(null);

// Hook personnalisé pour utiliser le contexte
export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase doit être utilisé dans un SupabaseProvider');
  }
  return context;
}

// Props du provider
interface SupabaseProviderProps {
  children: React.ReactNode;
}

// Provider du contexte
export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialisation et gestion de l'état de l'authentification
  useEffect(() => {
    // Charger la session initiale
    supabaseService.auth.getSession()
      .then(session => {
        if (session) {
          setUser(session.user);
          appState.getState().user = session.user;
        }
      })
      .catch(error => setError(error))
      .finally(() => setLoading(false));

    // S'abonner aux changements d'authentification
    const { data: { subscription } } = supabaseService.auth.onAuthStateChange(
      (_event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        appState.getState().user = newUser;
        setError(null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Méthodes d'authentification
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabaseService.auth.signIn(email, password);
      return user;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur de connexion'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabaseService.auth.signUp(email, password);
      return user;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur d\'inscription'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await supabaseService.auth.signOut();
      setUser(null);
      appState.getState().user = null;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur de déconnexion'));
    } finally {
      setLoading(false);
    }
  };

  // Méthodes de base de données
  const query = async <T extends keyof Database['public']['Tables']>(
    table: T,
    options: {
      select?: string;
      eq?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
    } = {}
  ) => {
    try {
      return await supabaseService.database.query(table, options);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur de requête'));
      return [];
    }
  };

  // Méthodes de stockage
  const uploadFile = async (bucket: string, path: string, file: File) => {
    try {
      return await supabaseService.storage.uploadFile(bucket, path, file);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur d\'upload'));
      return null;
    }
  };

  const downloadFile = async (bucket: string, path: string) => {
    try {
      return await supabaseService.storage.downloadFile(bucket, path);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur de téléchargement'));
      return null;
    }
  };

  const listFiles = async (bucket: string, path: string) => {
    try {
      return await supabaseService.storage.listFiles(bucket, path);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur de listage'));
      return null;
    }
  };

  // Valeur du contexte
  const value: SupabaseContextType = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    query,
    uploadFile,
    downloadFile,
    listFiles
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
} 