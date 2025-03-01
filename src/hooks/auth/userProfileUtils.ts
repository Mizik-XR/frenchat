
import { supabase } from "@/integrations/supabase/client";

// Fonction pour vérifier le profil utilisateur et les configurations
export async function checkUserAndConfig(session: any) {
  if (!session?.user) return null;
  
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_first_login')
      .eq('id', session.user.id)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Erreur lors de la récupération du profil:", profileError);
    }

    const { data: configs, error: configError } = await supabase
      .from('service_configurations')
      .select('service_type, status')
      .in('service_type', ['google_drive', 'microsoft_teams', 'llm']);

    if (configError) {
      console.error("Erreur lors de la récupération des configurations:", configError);
    }

    return { profile, configs };
  } catch (error) {
    console.error("Erreur lors de la vérification de l'utilisateur:", error);
    return null;
  }
}

// Vérifier si l'utilisateur a besoin d'une configuration
export function needsConfiguration(configs: any[] | null) {
  if (!configs || !configs.length) return true;
  return !configs.some(c => c.status === 'configured');
}
