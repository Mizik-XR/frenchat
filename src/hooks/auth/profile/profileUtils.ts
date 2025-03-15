
import { supabase } from "@/integrations/supabase/client";

/**
 * Gère la récupération du profil utilisateur et de sa configuration
 */
export const handleProfileAndConfig = async (userId: string) => {
  if (!userId) return { profile: null, configs: [], needsConfig: false, isFirstLogin: false };

  try {
    // Récupérer le profil utilisateur avec une requête simplifiée pour éviter la récursion
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, created_at, updated_at, full_name, avatar_url")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Erreur lors de la récupération du profil:", profileError);
      
      // En cas d'erreur, créer un profil minimal
      return { 
        profile: { id: userId, isFirstLogin: true }, 
        profileError, 
        configs: [], 
        needsConfig: true, 
        isFirstLogin: true 
      };
    }

    // Déterminer si c'est la première connexion en fonction de la date de création
    const isFirstLogin = profile ? 
      new Date().getTime() - new Date(profile.created_at).getTime() < 5 * 60 * 1000 : // 5 minutes
      true;

    // Récupérer les configurations de l'utilisateur
    const { data: configs, error: configError } = await supabase
      .from("service_configurations")
      .select("id, service_type, status, created_at")
      .eq("user_id", userId);

    if (configError) {
      console.error("Erreur lors de la récupération des configurations:", configError);
      return { profile, configs: [], needsConfig: true, isFirstLogin };
    }

    // Déterminer si une configuration est nécessaire
    const hasConfigured = configs && configs.some(config => config.status === "configured");
    
    return {
      profile,
      configs: configs || [],
      needsConfig: !hasConfigured,
      isFirstLogin
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return { profile: null, configs: [], needsConfig: true, isFirstLogin: false, error };
  }
};
