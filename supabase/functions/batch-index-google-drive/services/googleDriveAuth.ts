
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

/**
 * Récupère le token d'accès Google Drive pour un utilisateur donné
 */
export async function getGoogleDriveToken(userId: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await supabase.functions.invoke('google-oauth', {
      body: { 
        action: 'check_token_status', 
        userId: userId 
      }
    });
    
    if (error || !data.isValid) {
      console.error("Erreur lors de la récupération du token:", error || data.error);
      throw new Error("Token invalide ou expiré");
    }
    
    const { data: tokenData, error: tokenError } = await supabase.functions.invoke('google-oauth', {
      body: { 
        action: 'get_token', 
        userId: userId 
      }
    });
    
    if (tokenError || !tokenData.access_token) {
      console.error("Erreur lors de la récupération du token déchiffré:", tokenError);
      throw new Error("Impossible d'obtenir le token d'accès");
    }
    
    return tokenData;
  } catch (error) {
    console.error("Erreur lors de la récupération du token Google Drive:", error);
    throw error;
  }
}
