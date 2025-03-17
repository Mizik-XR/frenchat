
import { supabase } from '@/integrations/supabase/client';

// Définir les types
interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

interface UserConfig {
  id: string;
  user_id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at?: string;
}

interface ProfileResult {
  profile: UserProfile | null;
  configs: UserConfig[];
  needsConfig: boolean;
  isFirstLogin: boolean;
  error: Error | null;
}

/**
 * Récupère le profil utilisateur et sa configuration
 * @returns Informations sur le profil, la configuration et le statut de connexion
 */
export async function fetchUserProfile(): Promise<ProfileResult> {
  try {
    // Récupérer les informations utilisateur actuelles
    const { data: userData, error: authError } = await supabase.auth.getUser();
    
    if (authError || !userData.user) {
      return {
        profile: null,
        configs: [],
        needsConfig: true,
        isFirstLogin: false,
        error: authError || new Error('Utilisateur non authentifié')
      };
    }
    
    const userId = userData.user.id;
    
    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    // Récupérer les configurations utilisateur
    const { data: configs, error: configError } = await supabase
      .from('user_configs')
      .select('*')
      .eq('user_id', userId);
    
    // Déterminer s'il s'agit de la première connexion
    const isFirstLogin = !profile || profile.is_first_login === true;
    
    // Déterminer si une configuration est nécessaire
    const needsConfig = !configs || configs.length === 0;
    
    return {
      profile: profile || null,
      configs: configs || [],
      needsConfig,
      isFirstLogin,
      error: profileError || configError || null
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du profil utilisateur:', error);
    return {
      profile: null,
      configs: [],
      needsConfig: true,
      isFirstLogin: false,
      error: error as Error
    };
  }
}

/**
 * Récupère le profil utilisateur avec sa configuration
 * @returns Informations sur le profil et le statut de connexion
 */
export async function getUserProfileWithConfig() {
  return await fetchUserProfile();
}
