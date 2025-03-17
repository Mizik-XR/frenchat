
import type { Profile, UserWithProfile } from './sharedTypes';
import { supabase } from './client';

/**
 * Récupère le profil utilisateur depuis Supabase
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception lors de la récupération du profil:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a complété son profil
 */
export function hasCompletedProfile(profile: Profile | null): boolean {
  if (!profile) return false;
  
  // Vérifier si les champs essentiels sont remplis
  return !!profile.full_name;
}

/**
 * Met à jour le profil utilisateur
 */
export async function updateUserProfile(userId: string, profileData: Partial<Profile>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId);

    if (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception lors de la mise à jour du profil:', error);
    return false;
  }
}

// Autres fonctions utilitaires pour les profils...
