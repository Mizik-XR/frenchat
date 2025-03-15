
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useSupabaseUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Si Supabase n'est pas défini, considérer comme non chargé mais sans erreur
    if (!supabase) {
      console.warn('Client Supabase non disponible, mode hors ligne possible');
      setIsLoading(false);
      return;
    }

    // Fetch current user on mount with error handling
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          throw error;
        }
        
        setUser(data.user);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Ne pas effacer l'utilisateur en cas d'erreur réseau pour éviter les déconnexions
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Set up auth state listener with error handling
    let subscription: { unsubscribe: () => void } | undefined;
    
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      subscription = data.subscription;
    } catch (err) {
      console.error('Erreur lors de la configuration du listener d\'authentification:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }

    // Cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    error,
  };
}
