
// Intégration du client Supabase pour l'authentification et l'accès à la base de données

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './types';

// Type pour les réponses des Edge Functions
export type EdgeFunctionResponse<T = any> = {
  data: T | null;
  error: Error | null;
};

// Variables d'état de l'application
export const APP_STATE = {
  isOfflineMode: false,
  setOfflineMode: (value: boolean) => {
    APP_STATE.isOfflineMode = value;
    localStorage.setItem('OFFLINE_MODE', value ? 'true' : 'false');
    // Déclencher un événement de stockage pour avertir les autres onglets
    window.dispatchEvent(new Event('APP_STATE_CHANGE'));
  },
  hasSupabaseError: false,
  lastSupabaseError: null as Error | null,
  isInit: false
};

// Initialiser le mode hors ligne à partir du stockage local
if (typeof window !== 'undefined') {
  APP_STATE.isOfflineMode = localStorage.getItem('OFFLINE_MODE') === 'true';
}

// URL et clé Supabase à partir des variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérifier les variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variables d\'environnement Supabase manquantes', {
    url: supabaseUrl ? '[défini]' : '[manquant]',
    key: supabaseAnonKey ? '[défini]' : '[manquant]'
  });
}

// Options de configuration du client Supabase
const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'filechat_auth_token',
  },
  global: {
    headers: {
      'x-app-version': import.meta.env.VITE_LOVABLE_VERSION || 'dev',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    timeout: 20000, // Timeout plus long pour les connexions en temps réel
  },
};

// Débogage
console.log('Initialisation de Supabase avec:', {
  url: supabaseUrl ? '[défini]' : '[manquant]',
  key: supabaseAnonKey ? '[défini]' : '[manquant]',
  options
});

// Créer et exporter le client Supabase
export const supabase: SupabaseClient<Database> = supabaseUrl && supabaseAnonKey
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, options)
  : null;

// Initialiser l'écouteur d'événements d'authentification
if (supabase) {
  console.log('Supabase initialisé avec succès');
  
  // Détecter les changements d'état d'authentification
  supabase.auth.onAuthStateChange((event, session) => {
    console.log('Événement d\'authentification Supabase:', event, session ? '[session présente]' : '[pas de session]');
    
    if (event === 'SIGNED_OUT') {
      console.log('Utilisateur déconnecté, nettoyage du stockage local');
      // Nettoyer les données sensibles du stockage local
    }
  });
} else {
  console.error('Échec de l\'initialisation de Supabase en raison de variables d\'environnement manquantes');
  APP_STATE.hasSupabaseError = true;
  APP_STATE.lastSupabaseError = new Error('Variables d\'environnement Supabase manquantes');
}

// Fonction pour vérifier si l'authentification est disponible
export const isAuthAvailable = (): boolean => {
  return !!supabase;
};

// Fonctions utilitaires pour la gestion des sessions
export const preloadSession = async () => {
  if (!supabase) return null;
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Erreur lors du chargement de la session:', error);
    APP_STATE.hasSupabaseError = true;
    APP_STATE.lastSupabaseError = error instanceof Error ? error : new Error('Erreur inconnue');
    return null;
  }
};

// Fonction pour gérer les requêtes de profil utilisateur
export const handleProfileQuery = async (userId: string) => {
  if (!supabase || !userId) return { data: null, error: new Error('Client Supabase non initialisé ou ID utilisateur manquant') };
  
  try {
    const { data, error } = await supabase.rpc('get_minimal_profile', { user_id: userId });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Erreur inconnue') };
  }
};

// État global de l'application
APP_STATE.isInit = true;
