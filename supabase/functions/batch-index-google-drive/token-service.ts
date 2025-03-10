
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

// Service pour la gestion des tokens Google Drive
export async function getGoogleDriveToken(userId: string) {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`[TOKEN] Vérification du token pour l'utilisateur ${userId.substring(0, 8)}...`);
    const { data, error } = await supabase.functions.invoke('google-oauth', {
      body: { 
        action: 'check_token_status', 
        userId: userId 
      }
    });
    
    if (error || !data.isValid) {
      console.error(`[TOKEN ERREUR] Vérification du token: ${error?.message || data?.error || 'Token invalide'}`);
      throw new Error("Token invalide ou expiré");
    }
    
    console.log(`[TOKEN] Token valide, récupération du token déchiffré`);
    const { data: tokenData, error: tokenError } = await supabase.functions.invoke('google-oauth', {
      body: { 
        action: 'get_token', 
        userId: userId 
      }
    });
    
    if (tokenError || !tokenData.access_token) {
      console.error(`[TOKEN ERREUR] Récupération du token déchiffré: ${tokenError?.message || 'Token manquant'}`);
      throw new Error("Impossible d'obtenir le token d'accès");
    }
    
    console.log(`[TOKEN] Token récupéré avec succès`);
    return tokenData.access_token;
  } catch (error) {
    console.error(`[TOKEN ERREUR CRITIQUE] ${error.message}`, error);
    throw error;
  }
}
