/**
 * Configuration Supabase
 * 
 * Ce fichier contient les constantes et configurations pour l'intégration Supabase.
 * Les valeurs sont chargées depuis les variables d'environnement.
 */

import { RealtimeChannel } from '@supabase/supabase-js';

// URL de l'API Supabase
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL est requis');
}

// Clé anonyme de l'API Supabase
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_ANON_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY est requis');
}

// Configuration du client
export const clientConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    eventsPerSecond: 10,
    realtimeUrl: `${SUPABASE_URL}/realtime/v1`,
    params: {
      eventsPerSecond: 10
    }
  },
  db: {
    schema: 'public' as const
  }
} as const;

// Configuration des buckets de stockage
export const storageBuckets = {
  documents: 'documents',
  avatars: 'avatars'
} as const;

// Configuration des tables
export const tables = {
  users: 'users',
  conversations: 'conversations',
  messages: 'messages',
  documents: 'documents',
  settings: 'settings'
} as const;

// Configuration des canaux temps réel
export const realtimeChannels = {
  messages: 'messages',
  conversations: 'conversations'
} as const;

// Types d'événements temps réel
export const realtimeEvents = {
  insert: 'INSERT',
  update: 'UPDATE',
  delete: 'DELETE'
} as const;

// Configuration des requêtes
export const queryConfig = {
  defaultPageSize: 20,
  maxPageSize: 100,
  defaultOrderBy: 'created_at',
  defaultOrderDirection: 'desc'
} as const;

// Configuration de l'authentification
export const authConfig = {
  redirectTo: typeof window !== 'undefined' ? window.location.origin : '',
  passwordMinLength: 8,
  passwordMaxLength: 72
} as const;
