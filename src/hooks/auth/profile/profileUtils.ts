
import { supabase } from "@/integrations/supabase/client";

/**
 * Gère la récupération du profil utilisateur et de sa configuration
 */
export const handleProfileAndConfig = async (userId: string) => {
  if (!userId) return { profile: null, configs: [], needsConfig: false, isFirstLogin: false };

  try {
    // Récupérer le profil utilisateur avec une requête simplifiée
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, created_at, updated_at, is_first_login, full_name, avatar_url")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Erreur lors de la récupération du profil:", profileError);
      
      try {
        // Créer un profil minimal en cas d'erreur
        return { 
          profile: { id: userId, is_first_login: true }, 
          configs: [], 
          needsConfig: true, 
          isFirstLogin: true 
        };
      } catch (innerError) {
        console.error("Erreur lors de la création d'un profil minimal:", innerError);
        return { profile: null, configs: [], needsConfig: true, isFirstLogin: false };
      }
    }

    // Récupérer les configurations de l'utilisateur
    const { data: configs, error: configError } = await supabase
      .from("service_configurations")
      .select("id, service_type, status, created_at")
      .eq("user_id", userId);

    if (configError) {
      console.error("Erreur lors de la récupération des configurations:", configError);
      return { 
        profile, 
        configs: [], 
        needsConfig: true, 
        isFirstLogin: profile?.is_first_login || false 
      };
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
