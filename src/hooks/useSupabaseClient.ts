import { useState, useEffect } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export function useSupabaseClient() {
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadClient() {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        setClient(supabase);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load Supabase client'));
      } finally {
        setLoading(false);
      }
    }

    loadClient();
  }, []);

  return { client, loading, error };
} 