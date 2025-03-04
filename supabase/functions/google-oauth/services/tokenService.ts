
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { encryptToken, decryptToken } from '../utils/encryption.ts';

// Interface pour les tokens stockés
interface StoredToken {
  access_token: string | null;
  refresh_token: string | null;
  expires_at: string;
  metadata: any;
}

// Interface pour les informations utilisateur
interface UserInfo {
  email: string;
  name: string;
  picture: string;
}

export async function getStoredToken(
  supabase: ReturnType<typeof createClient>,
  userId: string, 
  provider = 'google',
  tokenEncryptionKey: string
): Promise<StoredToken | null> {
  const { data, error } = await supabase
    .from('oauth_tokens')
    .select('access_token, refresh_token, expires_at, metadata')
    .eq('user_id', userId)
    .eq('provider', provider)
    .maybeSingle();
  
  if (error) {
    console.error("Erreur lors de la récupération du token:", error);
    throw error;
  }
  
  if (!data) {
    return null;
  }
  
  try {
    // Déchiffrement des tokens avant de les renvoyer
    return {
      ...data,
      access_token: data.access_token ? decryptToken(data.access_token, tokenEncryptionKey) : null,
      refresh_token: data.refresh_token ? decryptToken(data.refresh_token, tokenEncryptionKey) : null,
    };
  } catch (error) {
    console.error("Erreur lors du déchiffrement des tokens stockés:", error);
    throw new Error("Impossible de déchiffrer les tokens stockés");
  }
}

export async function storeToken(
  supabase: ReturnType<typeof createClient>,
  userId: string, 
  accessToken: string, 
  refreshToken: string | null, 
  expiresIn: number, 
  userInfo: UserInfo,
  provider = 'google',
  tokenEncryptionKey: string
) {
  try {
    // Chiffrement des tokens avant stockage
    const encryptedAccessToken = encryptToken(accessToken, tokenEncryptionKey);
    const encryptedRefreshToken = refreshToken ? encryptToken(refreshToken, tokenEncryptionKey) : null;
    
    // Calcul de la date d'expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);
    
    const { data, error } = await supabase
      .from('oauth_tokens')
      .upsert({
        user_id: userId,
        provider: provider,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: expiresAt.toISOString(),
        metadata: {
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
          updated_at: new Date().toISOString()
        }
      }, { onConflict: 'user_id,provider' });
    
    if (error) {
      console.error("Erreur lors du stockage du token:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Erreur lors du chiffrement et stockage des tokens:", error);
    throw new Error("Impossible de stocker les tokens chiffrés");
  }
}

export async function refreshAccessToken(
  supabase: ReturnType<typeof createClient>,
  userId: string, 
  refreshToken: string,
  googleClientId: string,
  googleClientSecret: string,
  tokenEncryptionKey: string
) {
  try {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      client_id: googleClientId,
      client_secret: googleClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });
    
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Erreur lors du rafraîchissement du token:", data);
      throw new Error(`Erreur Google OAuth: ${data.error_description || data.error || 'Erreur inconnue'}`);
    }
    
    // Récupérer les métadonnées actuelles
    const { data: tokenData } = await supabase
      .from('oauth_tokens')
      .select('metadata')
      .eq('user_id', userId)
      .eq('provider', 'google')
      .single();
    
    // Chiffrement du nouveau token d'accès
    const encryptedAccessToken = encryptToken(data.access_token, tokenEncryptionKey);
    
    // Calcul de la nouvelle date d'expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expires_in);
    
    // Mise à jour dans la base de données
    const { error } = await supabase
      .from('oauth_tokens')
      .update({
        access_token: encryptedAccessToken,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider', 'google');
    
    if (error) {
      console.error("Erreur lors de la mise à jour du token rafraîchi:", error);
      throw error;
    }
    
    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
      expires_at: expiresAt.toISOString()
    };
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    throw error;
  }
}
