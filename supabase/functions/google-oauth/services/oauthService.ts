
import { getStoredToken } from './tokenService.ts';

// Fonction pour échanger le code d'autorisation contre des tokens d'accès
export async function exchangeCodeForTokens(code: string, redirectUrl: string, googleClientId: string, googleClientSecret: string) {
  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams({
    code: code,
    client_id: googleClientId,
    client_secret: googleClientSecret,
    redirect_uri: redirectUrl,
    grant_type: 'authorization_code'
  });
  
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error("Erreur lors de l'échange du code:", data);
      throw new Error(`Erreur Google OAuth: ${data.error_description || data.error || 'Erreur inconnue'}`);
    }
    
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      id_token: data.id_token
    };
  } catch (error) {
    console.error("Erreur lors de l'échange du code OAuth:", error);
    throw error;
  }
}

// Fonction pour récupérer les informations de l'utilisateur Google
export async function fetchGoogleUserInfo(accessToken: string) {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erreur Google API: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la récupération des informations utilisateur:", error);
    throw error;
  }
}

// Fonction pour révoquer un token
export async function revokeToken(supabase, userId: string, tokenEncryptionKey: string) {
  try {
    // D'abord, récupérer et déchiffrer le token
    const tokenData = await getStoredToken(supabase, userId, 'google', tokenEncryptionKey);
    
    if (!tokenData || !tokenData.access_token) {
      console.error("Aucun token à révoquer pour l'utilisateur:", userId);
      return { success: false, error: "Aucun token trouvé" };
    }
    
    // Révoquer le token auprès de Google
    const revokeUrl = 'https://oauth2.googleapis.com/revoke';
    const params = new URLSearchParams({
      token: tokenData.access_token
    });
    
    const response = await fetch(revokeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    // Même si la révocation échoue côté Google, nous supprimons l'entrée de notre base de données
    const { error } = await supabase
      .from('oauth_tokens')
      .delete()
      .eq('user_id', userId)
      .eq('provider', 'google');
    
    if (error) {
      console.error("Erreur lors de la suppression du token:", error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de la révocation du token:", error);
    throw error;
  }
}

// Fonction pour vérifier l'état d'un token
export async function checkTokenStatus(supabase, userId: string, tokenEncryptionKey: string) {
  try {
    const tokenData = await getStoredToken(supabase, userId, 'google', tokenEncryptionKey);
    
    if (!tokenData || !tokenData.access_token) {
      return { isValid: false };
    }
    
    // Vérifier si le token est expiré
    const currentTime = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (currentTime >= expiresAt) {
      console.log("Token expiré pour l'utilisateur:", userId);
      
      // Si nous avons un refresh_token, nous pourrions le rafraîchir automatiquement ici
      if (tokenData.refresh_token) {
        try {
          // Note: refreshAccessToken implementation would be called here but requires
          // additional parameters not provided in this context
          // This would need to be handled in the main entry point
          return { isValid: false, error: "Token expiré - nécessite rafraîchissement" };
        } catch (refreshError) {
          console.error("Échec du rafraîchissement automatique:", refreshError);
          return { isValid: false, error: "Token expiré et rafraîchissement échoué" };
        }
      }
      
      return { isValid: false, error: "Token expiré" };
    }
    
    // Calculer le temps restant avant expiration (en secondes)
    const expiresIn = Math.floor((expiresAt.getTime() - currentTime.getTime()) / 1000);
    
    return { 
      isValid: true, 
      expiresIn: expiresIn 
    };
  } catch (error) {
    console.error("Erreur lors de la vérification du statut du token:", error);
    return { isValid: false, error: "Erreur de vérification" };
  }
}
