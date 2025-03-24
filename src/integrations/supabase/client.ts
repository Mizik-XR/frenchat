/**
 * Client Supabase Minimal
 * 
 * Ce module fournit une instance unique du client Supabase
 * sans dépendances circulaires. Il est conçu pour être importé par
 * supabaseService qui expose les API nécessaires.
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validation de la configuration
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[Supabase] Variables d\'environnement manquantes: URL ou clé anonyme non définies.');
}

// Instance singleton
let supabaseInstance: SupabaseClient<Database> | null = null;

/**
 * Obtenir une instance unique du client Supabase
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (supabaseInstance) return supabaseInstance;
  
  try {
    supabaseInstance = createClient<Database>(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
    console.info('[Supabase] Initialisation du client réussie');
  } catch (error) {
    console.error('[Supabase] Erreur lors de l\'initialisation du client:', error);
    // Fallback à un client vide en mode hors ligne
    if (!supabaseInstance) {
      supabaseInstance = createClient<Database>(
        SUPABASE_URL || 'https://placeholder.supabase.co',
        SUPABASE_ANON_KEY || 'placeholder-key',
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          },
        }
      );
    }
  }
  
  return supabaseInstance;
}

// Exporter le client pour compatibilité avec le code existant
// Note: Pour les nouvelles fonctionnalités, utilisez plutôt supabaseService
export const supabase = getSupabaseClient();