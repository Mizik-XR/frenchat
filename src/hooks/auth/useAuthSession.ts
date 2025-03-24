import { useState, useEffect } from 'react';
import { supabase } from '@/compatibility/supabaseCompat';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  error: Error | null;
  isLoading: boolean;
}

export function useAuthSession() {
  const [state, setState] = useState<AuthState>({
    session: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      setState(prev => ({
        ...prev,
        session,
        error: error || null,
        isLoading: false,
      }));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setState(prev => ({
          ...prev,
          session,
          isLoading: false,
        }));
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return state;
} 