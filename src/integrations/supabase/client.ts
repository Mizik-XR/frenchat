
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dbdueopvtlanxgumenpu.supabase.co';
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// État global de l'application
export const APP_STATE = {
  isOfflineMode: false,
  authLoading: true,
  sessionLoaded: false,
  user: null,
  initComplete: false
};

// Création du client Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Fonctions utilitaires pour la gestion de session
export const preloadSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return { session };
  } catch (error) {
    console.error("Erreur lors du préchargement de la session:", error);
    return { session: null };
  }
};

// Fonctions utilitaires pour les requêtes de profil
export const handleProfileQuery = async (userId: string) => {
  if (!userId) return { data: null, error: new Error('ID utilisateur non fourni') };
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  } catch (error) {
    console.error("Erreur lors de la requête de profil:", error);
    return { data: null, error };
  }
};

// Vérification de la connexion Supabase
export const checkSupabaseConnection = async () => {
  try {
    const { data } = await supabase.from('service_configurations').select('count').limit(1);
    return data !== null;
  } catch (error) {
    console.error("Erreur de connexion à Supabase:", error);
    return false;
  }
};

// Type pour les réponses des Edge Functions
export type EdgeFunctionResponse<T> = {
  data: T;
  error: null;
} | {
  data: null;
  error: {
    message: string;
  };
};

export default supabase;
