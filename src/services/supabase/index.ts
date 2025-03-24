/**
 * Service Supabase Centralisé
 * 
 * Ce module fournit une interface unifiée pour toutes les opérations Supabase,
 * organisée par domaine (auth, storage, database) pour éviter les dépendances circulaires.
 */

import { getSupabaseClient } from '@/integrations/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Types
export type { Database } from '@/integrations/supabase/types';

// Instance du client
let client: SupabaseClient<Database> | null = null;

// Gestionnaire d'erreurs centralisé
const handleError = (error: any, context: string) => {
  console.error(`[SupabaseService] Erreur dans ${context}:`, error);
  throw error;
};

// Initialisation du client
export function initializeClient() {
  if (!client) {
    client = getSupabaseClient();
  }
  return client;
}

// Service d'authentification
export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await initializeClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) handleError(error, 'signIn');
    return data;
  },

  async signUp(email: string, password: string) {
    const { data, error } = await initializeClient().auth.signUp({
      email,
      password,
    });
    if (error) handleError(error, 'signUp');
    return data;
  },

  async signOut() {
    const { error } = await initializeClient().auth.signOut();
    if (error) handleError(error, 'signOut');
  },

  async getSession() {
    const { data: { session }, error } = await initializeClient().auth.getSession();
    if (error) handleError(error, 'getSession');
    return session;
  },

  async getUser() {
    const { data: { user }, error } = await initializeClient().auth.getUser();
    if (error) handleError(error, 'getUser');
    return user;
  }
};

// Service de stockage
export const storageService = {
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await initializeClient().storage
      .from(bucket)
      .upload(path, file);
    if (error) handleError(error, 'uploadFile');
    return data;
  },

  async downloadFile(bucket: string, path: string) {
    const { data, error } = await initializeClient().storage
      .from(bucket)
      .download(path);
    if (error) handleError(error, 'downloadFile');
    return data;
  },

  async listFiles(bucket: string, path: string) {
    const { data, error } = await initializeClient().storage
      .from(bucket)
      .list(path);
    if (error) handleError(error, 'listFiles');
    return data;
  }
};

// Service de base de données
export const databaseService = {
  async query<T extends keyof Database['public']['Tables']>(
    table: T,
    options: {
      select?: string;
      eq?: Record<string, any>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
    } = {}
  ) {
    let query = initializeClient()
      .from(table)
      .select(options.select || '*');

    if (options.eq) {
      Object.entries(options.eq).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    if (options.order) {
      query = query.order(options.order.column, { ascending: options.order.ascending ?? true });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) handleError(error, 'query');
    return data as Database['public']['Tables'][T]['Row'][];
  },

  async insert<T extends keyof Database['public']['Tables']>(
    table: T,
    values: Database['public']['Tables'][T]['Insert']
  ) {
    const { data, error } = await initializeClient()
      .from(table)
      .insert(values)
      .select();
    if (error) handleError(error, 'insert');
    return data as Database['public']['Tables'][T]['Row'][];
  },

  async update<T extends keyof Database['public']['Tables']>(
    table: T,
    values: Database['public']['Tables'][T]['Update'],
    conditions: Record<string, any>
  ) {
    let query = initializeClient()
      .from(table)
      .update(values);

    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.select();
    if (error) handleError(error, 'update');
    return data as Database['public']['Tables'][T]['Row'][];
  },

  async delete<T extends keyof Database['public']['Tables']>(
    table: T,
    conditions: Record<string, any>
  ) {
    let query = initializeClient()
      .from(table)
      .delete();

    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    const { data, error } = await query.select();
    if (error) handleError(error, 'delete');
    return data as Database['public']['Tables'][T]['Row'][];
  }
};

// Service de temps réel
export const realtimeService = {
  subscribe(channel: string, callback: (payload: any) => void) {
    return initializeClient()
      .channel(channel)
      .on('postgres_changes', { event: '*', schema: 'public', table: channel }, callback)
      .subscribe();
  },

  unsubscribe(subscription: any) {
    subscription.unsubscribe();
  }
};

// Export d'une instance unique pour la compatibilité
export const supabaseService = {
  auth: authService,
  storage: storageService,
  database: databaseService,
  realtime: realtimeService,
  initialize: initializeClient
}; 