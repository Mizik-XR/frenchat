
import { supabase } from './client';
import type { Json } from './types';

// Fonction pour vérifier la connexion à Supabase
export const ensureSupabaseConnection = async () => {
  try {
    const { data } = await supabase.from('profiles').select('count').limit(1);
    return !!data;
  } catch (error) {
    console.error("Erreur: Impossible de se connecter à Supabase.");
    return false;
  }
};

// Fonction pour créer un profil initial si nécessaire
export const createInitialProfileIfNeeded = async (userId: string) => {
  if (!await ensureSupabaseConnection()) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("Erreur lors de la récupération du profil:", error);
      return null;
    }

    if (!data) {
      console.log("Profil non trouvé, création d'un nouveau profil...");
      const newProfile = {
        id: userId,
        full_name: 'Nouveau Utilisateur',
        email: 'email@example.com',
        avatar_url: null,
        is_first_login: true
      };

      const { data: newProfileData, error: newProfileError } = await supabase
        .from('profiles')
        .insert([newProfile])
        .select()
        .single();

      if (newProfileError) {
        console.error("Erreur lors de la création du profil:", newProfileError);
        return null;
      }

      console.log("Nouveau profil créé:", newProfileData);
      return newProfileData;
    }

    console.log("Profil existant trouvé:", data);
    return data;
  } catch (error) {
    console.error("Erreur lors de la création/récupération du profil:", error);
    return null;
  }
};

// Fonction pour adapter les profils venant de Supabase
export const adaptProfile = (profile: any) => {
  if (!profile) return null;
  
  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    isFirstLogin: profile.is_first_login === true,
    clientId: profile.client_id
  };
};

// Fonction pour gérer les réponses de profil Supabase
export const processProfileResponse = (data: any) => {
  if (!data) return null;
  
  // Gérer le cas où is_first_login est stocké dans metadata
  if (data.metadata && typeof data.metadata === 'object') {
    const metadata = data.metadata as Record<string, any>;
    const isFirstLogin = metadata.is_first_login === true;
    return {
      ...adaptProfile(data),
      isFirstLogin
    };
  }
  
  return adaptProfile(data);
};

// Fonction pour mettre à jour le profil utilisateur
export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    // Convertir en format compatible avec Supabase
    const supabaseProfileData = {
      id: userId,
      full_name: profileData.fullName,
      email: profileData.email,
      avatar_url: profileData.avatarUrl,
      is_first_login: profileData.isFirstLogin
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert(supabaseProfileData)
      .select()
      .single();
      
    if (error) throw error;
    return processProfileResponse(data);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return null;
  }
};

// Fonction pour supprimer un profil utilisateur
export const deleteUserProfile = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression du profil:", error);
    return false;
  }
};
