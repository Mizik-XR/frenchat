
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import type { UserWithProfile } from './sharedTypes';

// Création du client Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * Récupère l'utilisateur actuel avec son profil
 * Utilise l'import dynamique pour éviter la dépendance circulaire
 */
export async function getCurrentUserWithProfile(): Promise<UserWithProfile | null> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData?.session?.user) {
      return null;
    }
    
    const user = sessionData.session.user;
    
    // Import dynamique pour éviter la dépendance circulaire
    const { getUserProfile } = await import('./profileUtils');
    const profile = await getUserProfile(user.id);
    
    return {
      id: user.id,
      email: user.email,
      profile
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur avec profil:', error);
    return null;
  }
}

// Réexporter les éléments nécessaires depuis le module de compatibilité
export { APP_STATE, preloadSession } from '@/compatibility/supabaseCompat';
export type { EdgeFunctionResponse } from './sharedTypes';
