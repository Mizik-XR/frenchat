/**
 * Hooks Supabase
 * 
 * Ce module fournit des hooks React pour interagir avec Supabase.
 * Il utilise le service Supabase centralisé pour éviter les dépendances circulaires.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabaseService } from '@/services/supabase';
import type { Database } from '@/services/supabase';
import type { RealtimeChannel, User, Session } from '@supabase/supabase-js';

/**
 * Hook pour gérer l'authentification Supabase
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Charger la session initiale
    supabaseService.auth.getSession()
      .then(session => setUser(session?.user ?? null))
      .catch(error => setError(error))
      .finally(() => setLoading(false));

    // S'abonner aux changements d'authentification
    const { data: { subscription } } = supabaseService.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setError(null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabaseService.auth.signIn(email, password);
      setUser(user);
      return user;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur de connexion'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabaseService.auth.signUp(email, password);
      setUser(user);
      return user;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur d\'inscription'));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await supabaseService.auth.signOut();
      setUser(null);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur de déconnexion'));
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut
  };
}

/**
 * Hook pour gérer les requêtes Supabase
 */
export function useQuery<T extends keyof Database['public']['Tables']>(
  table: T,
  options: {
    select?: string;
    eq?: Record<string, any>;
    order?: { column: string; ascending?: boolean };
    limit?: number;
  } = {}
) {
  const [data, setData] = useState<Database['public']['Tables'][T]['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await supabaseService.database.query(table, options);
      setData(result);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur de requête'));
    } finally {
      setLoading(false);
    }
  }, [table, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook pour gérer les abonnements temps réel Supabase
 */
export function useSubscription<T extends keyof Database['public']['Tables']>(
  table: T,
  callback: (payload: Database['public']['Tables'][T]['Row']) => void
) {
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const sub = supabaseService.realtime.subscribe(table, (payload) => {
        callback(payload as Database['public']['Tables'][T]['Row']);
      });
      setSubscription(sub);
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur d\'abonnement'));
    }

    return () => {
      if (subscription) {
        supabaseService.realtime.unsubscribe(subscription);
      }
    };
  }, [table, callback]);

  return {
    subscription,
    error
  };
}

/**
 * Hook pour gérer le stockage Supabase
 */
export function useStorage(bucket: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = useCallback(async (path: string, file: File) => {
    try {
      setLoading(true);
      setError(null);
      const data = await supabaseService.storage.uploadFile(bucket, path, file);
      return data;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur d\'upload'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [bucket]);

  const downloadFile = useCallback(async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await supabaseService.storage.downloadFile(bucket, path);
      return data;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur de téléchargement'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [bucket]);

  const listFiles = useCallback(async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await supabaseService.storage.listFiles(bucket, path);
      return data;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Erreur de listage'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [bucket]);

  return {
    loading,
    error,
    uploadFile,
    downloadFile,
    listFiles
  };
} 