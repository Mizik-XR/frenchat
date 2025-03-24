/**
 * Client Supabase
 * 
 * Ce module initialise et exporte le client Supabase.
 * Il utilise la configuration définie dans config.ts.
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_URL, SUPABASE_ANON_KEY, clientConfig } from './config';

let client: SupabaseClient<Database, 'public'> | null = null;

/**
 * Obtient une instance du client Supabase.
 * Crée une nouvelle instance si elle n'existe pas déjà.
 */
export function getSupabaseClient(): SupabaseClient<Database, 'public'> {
  if (!client) {
    client = createClient<Database, 'public'>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        ...clientConfig,
        db: {
          schema: 'public' as const
        }
      }
    );
  }
  return client;
}

/**
 * Réinitialise le client Supabase.
 * Utile pour les tests ou lorsqu'on veut forcer une nouvelle instance.
 */
export function resetSupabaseClient(): void {
  client = null;
}

/**
 * Vérifie si le client est initialisé.
 */
export function isClientInitialized(): boolean {
  return client !== null;
}

/**
 * Obtient l'URL de l'API Supabase.
 */
export function getApiUrl(): string {
  return SUPABASE_URL;
}

/**
 * Obtient la clé anonyme de l'API Supabase.
 */
export function getAnonKey(): string {
  return SUPABASE_ANON_KEY;
}

// Export par défaut
export default getSupabaseClient;