
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toJson } from '@/integrations/supabase/adapters';

export const createInitialProfile = async (user: User) => {
  if (!user?.id) return null;
  
  try {
    // Vérifier si le profil existe déjà
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Erreur lors de la vérification du profil existant:", fetchError);
      return null;
    }
    
    // Le profil existe déjà
    if (existingProfile) {
      console.log("Profil utilisateur existant trouvé");
      
      // Vérifier si first_login est défini
      const isFirstLogin = existingProfile.is_first_login !== false;
      
      // Mettre à jour le profil si c'est la première connexion
      if (isFirstLogin) {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ is_first_login: false })
          .eq('id', user.id)
          .select()
          .single();
          
        if (updateError) {
          console.error("Erreur lors de la mise à jour du profil:", updateError);
        }
        
        return updatedProfile;
      }
      
      return existingProfile;
    }
    
    // Créer un nouveau profil si inexistant
    console.log("Création d'un nouveau profil utilisateur");
    const newProfileData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      is_first_login: true
    };
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(newProfileData)
      .select()
      .single();
      
    if (insertError) {
      console.error("Erreur lors de la création du profil:", insertError);
      return null;
    }
    
    return newProfile;
  } catch (error) {
    console.error("Erreur lors de la création/vérification du profil:", error);
    return null;
  }
};

/**
 * Gère la récupération du profil utilisateur et de sa configuration
 */
export const handleProfileAndConfig = async (userId: string) => {
  if (!userId) return { profile: null, configs: [], needsConfig: false, isFirstLogin: false };

  try {
    // Récupérer le profil utilisateur avec une requête simplifiée pour éviter la récursion
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, created_at, updated_at, is_first_login, full_name, avatar_url")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Erreur lors de la récupération du profil:", profileError);
      
      // En cas d'erreur, créer un profil minimal
      return { 
        profile: { id: userId, is_first_login: true }, 
        profileError, 
        configs: [], 
        needsConfig: true, 
        isFirstLogin: true 
      };
    }

    // Récupérer les configurations de l'utilisateur
    const { data: configs, error: configError } = await supabase
      .from("service_configurations")
      .select("id, service_type, status, created_at, configuration")
      .eq("user_id", userId);

    if (configError) {
      console.error("Erreur lors de la récupération des configurations:", configError);
      return { profile, configs: [], needsConfig: true, isFirstLogin: profile?.is_first_login || false };
    }

    // Déterminer si une configuration est nécessaire
    const hasConfigured = configs && configs.some(config => config.status === "configured");
    
    return {
      profile,
      configs: configs || [],
      needsConfig: !hasConfigured,
      isFirstLogin: profile?.is_first_login || false
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return { profile: null, configs: [], needsConfig: true, isFirstLogin: false, error };
  }
};
