
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
          isFirstLogin: true,
          error: profileError
        };
      } catch (innerError) {
        console.error("Erreur lors de la création d'un profil minimal:", innerError);
        return { 
          profile: null, 
          configs: [], 
          needsConfig: true, 
          isFirstLogin: false,
          error: innerError 
        };
      }
    }

    // Vérifier si le profil est bien récupéré
    if (!profile) {
      return {
        profile: null,
        configs: [],
        needsConfig: true,
        isFirstLogin: true,
        error: new Error('Profil non trouvé')
      };
    }

    // Utiliser des types explicites pour éviter les problèmes de profondeur excessive
    const isFirstLogin = !!profile.is_first_login;

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
        isFirstLogin,
        error: configError
      };
    }

    // Convertir explicitement les configurations pour éviter les erreurs de type
    const configsArray = configs || [];
    
    // Déterminer si une configuration est nécessaire
    const hasConfigured = configsArray.some(config => config.status === "configured");
    
    return {
      profile,
      configs: configsArray,
      needsConfig: !hasConfigured,
      isFirstLogin
    };
  } catch (error) {
    console.error("Erreur inattendue:", error);
    return { 
      profile: null, 
      configs: [], 
      needsConfig: true, 
      isFirstLogin: false, 
      error 
    };
  }
};
