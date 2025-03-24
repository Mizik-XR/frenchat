/**
 * Supabase Client Service
 * 
 * Point d'entrée unique pour l'instance Supabase.
 * Ce module isole la création et la configuration du client Supabase
 * pour éviter les dépendances circulaires et assurer une seule instance.
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Configuration Supabase (pourrait être chargée depuis .env)
const SUPABASE_URL = "https://dbdueopvtlanxgumenpu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk";

// État interne (private)
let _initialized = false;
let _supabaseClient: SupabaseClient<Database> | null = null;
let _isOfflineMode = false;

/**
 * Initialise le client Supabase s'il n'est pas déjà initialisé
 * @returns Instance Supabase
 */
function initializeClient(): SupabaseClient<Database> {
  if (!_initialized) {
    try {
      _supabaseClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
      _initialized = true;
      console.log('Supabase client initialized successfully');
    } catch (error) {
      console.error('Error initializing Supabase client:', error);
      throw new Error('Failed to initialize Supabase client');
    }
  }
  
  return _supabaseClient!;
}

// Initialiser immédiatement le client
const client = initializeClient();

// Exporter également l'instance directe pour la compatibilité avec le code existant
// Pour les nouvelles fonctionnalités, préférer utiliser supabaseService
export const supabase = client;

/**
 * API publique pour accéder au client Supabase
 */
export const supabaseService = {
  /**
   * Obtenir le client Supabase
   */
  getClient: () => client,
  
  /**
   * Service d'authentification
   */
  auth: {
    getSession: async () => client.auth.getSession(),
    signInWithPassword: async (credentials: { email: string; password: string }) => 
      client.auth.signInWithPassword(credentials),
    signOut: async () => client.auth.signOut(),
    onAuthStateChange: (callback: any) => client.auth.onAuthStateChange(callback),
    getUser: async () => client.auth.getUser()
  },
  
  /**
   * Service de gestion des profils
   */
  profiles: {
    getProfile: async (userId: string) => 
      client.from('profiles').select('*').eq('id', userId).single(),
    updateProfile: async (userId: string, data: any) => 
      client.from('profiles').update(data).eq('id', userId),
    createProfile: async (profile: Database['public']['Tables']['profiles']['Insert']) => 
      client.from('profiles').insert(profile),
    upsertProfile: async (profile: Database['public']['Tables']['profiles']['Insert']) => 
      client.from('profiles').upsert(profile)
  },
  
  /**
   * Service de gestion des documents
   */
  documents: {
    getAll: async (userId: string) => 
      client.from('documents').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    getById: async (documentId: string) => 
      client.from('documents').select('*').eq('id', documentId).single(),
    create: async (document: Database['public']['Tables']['documents']['Insert']) => 
      client.from('documents').insert(document),
    update: async (id: string, data: Partial<Database['public']['Tables']['documents']['Update']>) => 
      client.from('documents').update(data).eq('id', id),
    delete: async (id: string) => 
      client.from('documents').delete().eq('id', id),
    archive: async (document: Database['public']['Tables']['documents']['Row']) => {
      // Archiver en créant une copie dans la table des archives
      const archived = {
        document_id: document.id,
        document_type: document.document_type,
        original_id: document.id,
        title: document.title,
        content: document.content,
        client_id: document.client_id,
        metadata: document.metadata,
        archived_at: new Date().toISOString()
      };
      return client.from('archived_documents').insert(archived);
    }
  },
  
  /**
   * État de connexion
   */
  connectivity: {
    get isOfflineMode() { return _isOfflineMode; },
    setOfflineMode: (value: boolean) => {
      _isOfflineMode = value;
      // Sauvegarder dans localStorage pour la persistance
      if (typeof window !== 'undefined') {
        localStorage.setItem('OFFLINE_MODE', value.toString());
        // Déclencher un événement pour que les autres composants puissent réagir
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'OFFLINE_MODE',
          newValue: value.toString()
        }));
      }
    },
    checkConnection: async () => {
      try {
        const { error } = await client.from('profiles').select('count').limit(1);
        return !error;
      } catch (err) {
        console.error("Erreur de connexion à Supabase:", err);
        supabaseService.connectivity.setOfflineMode(true);
        return false;
      }
    }
  },
  
  /**
   * Utility pour gérer le stockage de fichiers
   */
  storage: {
    uploadFile: async (bucket: string, path: string, file: File, options?: { upsert?: boolean }) => {
      const { data, error } = await client.storage.from(bucket).upload(path, file, {
        upsert: options?.upsert || false
      });
      return { data, error };
    },
    getPublicUrl: (bucket: string, path: string) => {
      return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    },
    downloadFile: async (bucket: string, path: string) => {
      return client.storage.from(bucket).download(path);
    },
    deleteFile: async (bucket: string, path: string) => {
      return client.storage.from(bucket).remove([path]);
    }
  }
};

// Pour éviter les dépendances circulaires lors des imports dynamiques
export const getSupabaseClient = () => client; 