/**
 * Service Supabase Centralisé
 * 
 * Ce service fournit une API complète pour interagir avec Supabase
 * tout en évitant les dépendances circulaires.
 * C'est le seul module qui devrait interagir directement avec le client Supabase.
 */

import { getSupabaseClient } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// État interne (private)
let _isOfflineMode = false;
let _errorLog: Error[] = [];

// Récupérer l'instance du client
const client = getSupabaseClient();

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
   * Service de gestion des conversations
   */
  conversations: {
    getAll: async (userId: string) => 
      client.from('chat_conversations').select('*').eq('user_id', userId).order('updated_at', { ascending: false }),
    getById: async (id: string) => 
      client.from('chat_conversations').select('*').eq('id', id).single(),
    create: async (conversation: { 
      title: string;
      user_id: string;
      settings?: any;
      folder_id?: string;
      is_pinned?: boolean;
      is_archived?: boolean;
    }) => 
      client.from('chat_conversations').insert(conversation),
    update: async (id: string, data: Partial<Database['public']['Tables']['chat_conversations']['Update']>) => 
      client.from('chat_conversations').update(data).eq('id', id),
    delete: async (id: string) => 
      client.from('chat_conversations').delete().eq('id', id),
    getMessages: async (conversationId: string) => 
      client.from('chat_messages').select('*').eq('conversation_id', conversationId).order('created_at', { ascending: true })
  },
  
  /**
   * Gestion du mode hors ligne et connectivité
   */
  connectivity: {
    get isOfflineMode() { return _isOfflineMode; },
    setOfflineMode: (value: boolean) => {
      _isOfflineMode = value;
      // Sauvegarder dans localStorage pour la persistance
      if (typeof window !== 'undefined') {
        localStorage.setItem('OFFLINE_MODE', value.toString());
        // Déclencher un événement pour que les autres composants puissent réagir
        window.dispatchEvent(new CustomEvent('connectivity-change', { 
          detail: { isOfflineMode: value } 
        }));
      }
    },
    checkConnection: async () => {
      try {
        const { error } = await client.from('profiles').select('count').limit(1);
        if (error) {
          supabaseService.connectivity.setOfflineMode(true);
          return false;
        }
        // Si on arrive ici, la connexion est établie
        return true;
      } catch (err) {
        console.error("[Supabase] Erreur de connexion:", err);
        supabaseService.connectivity.setOfflineMode(true);
        return false;
      }
    }
  },
  
  /**
   * Gestion des erreurs
   */
  errors: {
    logError: (error: Error) => {
      console.error('[Supabase Error]', error);
      _errorLog.push(error);
      
      // Si nécessaire, journaliser l'erreur vers un service d'analytics
      if (typeof window !== 'undefined' && 'gtag' in window) {
        // @ts-ignore
        window.gtag?.('event', 'supabase_error', {
          error_message: error.message,
          error_stack: error.stack
        });
      }
    },
    getErrorLog: () => [..._errorLog],
    clearErrorLog: () => { _errorLog = []; }
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