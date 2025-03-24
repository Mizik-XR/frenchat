import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dbdueopvtlanxgumenpu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk";

export type SupabaseCompatClient = ReturnType<typeof createCompatClient>;

export const createCompatClient = (url: string, key: string) => {
  const client = createClient<Database>(url, key);
  
  return {
    ...client,
    compat: {
      version: '2.x',
      auth: {
        ...client.auth,
        // Méthodes de rétrocompatibilité pour l'authentification
        async getUser() {
          const { data: { user }, error } = await client.auth.getUser();
          return { user, error };
        }
      },
      storage: {
        ...client.storage,
        // Méthodes de rétrocompatibilité pour le stockage
      }
    }
  };
};

// Instance compatible par défaut
export const supabaseCompat = createCompatClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
); 