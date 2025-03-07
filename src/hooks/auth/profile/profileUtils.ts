
import { supabase } from "@/integrations/supabase/client";

/**
 * Gère la récupération du profil utilisateur et de sa configuration
 */
export const handleProfileAndConfig = async (userId: string) => {
  if (!userId) return { profile: null, configs: [], needsConfig: false, isFirstLogin: false };

  try {
    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Erreur lors de la récupération du profil:", profileError);
      return { profile: null, profileError, configs: [], needsConfig: true, isFirstLogin: false };
    }

    // Récupérer les configurations de l'utilisateur
    const { data: configs, error: configError } = await supabase
      .from("service_configurations")
      .select("*")
      .eq("user_id", userId);

    if (configError) {
      console.error("Erreur lors de la récupération des configurations:", configError);
      return { profile, configs: [], needsConfig: true, isFirstLogin: profile?.is_first_login || false };
    }

    // Déterminer si une configuration est nécessaire
    const hasConfigured = configs.some(config => config.status === "configured");
    
    return {
      profile,
      configs,
      needsConfig: !hasConfigured,
      isFirstLogin: profile?.is_first_login || false
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return { profile: null, configs: [], needsConfig: true, isFirstLogin: false, error };
  }
};
