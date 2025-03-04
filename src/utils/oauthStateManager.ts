
/**
 * Gestionnaire d'état OAuth pour sécuriser les flux d'authentification
 */

/**
 * Génère un état aléatoire pour le flux OAuth et le stocke dans sessionStorage
 * @param provider Le fournisseur OAuth (google, microsoft, etc.)
 * @returns L'état généré
 */
export function generateOAuthState(provider: string): string {
  // Création d'un identifiant aléatoire suffisamment long pour être sécurisé
  const randomState = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Ajout d'un timestamp pour limiter la validité dans le temps
  const timestamp = Date.now();
  const state = `${randomState}_${timestamp}`;
  
  // Stockage dans sessionStorage
  sessionStorage.setItem(`oauth_state_${provider}`, state);
  
  return state;
}

/**
 * Vérifie si l'état OAuth retourné correspond à celui stocké
 * @param provider Le fournisseur OAuth
 * @param returnedState L'état retourné dans l'URL de callback
 * @returns true si l'état est valide, false sinon
 */
export function validateOAuthState(provider: string, returnedState: string): boolean {
  const storedState = sessionStorage.getItem(`oauth_state_${provider}`);
  
  // Si pas d'état stocké ou ne correspond pas, authentification invalide
  if (!storedState || storedState !== returnedState) {
    console.error("État OAuth invalide, possible tentative CSRF");
    return false;
  }
  
  // Vérifier si l'état n'est pas trop ancien (validité de 15 minutes)
  const timestamp = parseInt(storedState.split('_')[1], 10);
  const now = Date.now();
  const fifteenMinutesMs = 15 * 60 * 1000;
  
  if (now - timestamp > fifteenMinutesMs) {
    console.error("État OAuth expiré");
    return false;
  }
  
  // Nettoyer l'état utilisé
  sessionStorage.removeItem(`oauth_state_${provider}`);
  return true;
}

/**
 * Stocke de manière sécurisée un token d'accès temporaire
 * @param provider Le fournisseur OAuth
 * @param token Le token à stocker
 */
export function storeOAuthToken(provider: string, token: string): void {
  // Utilisation de sessionStorage pour des raisons de sécurité (durée de vie limitée à la session)
  sessionStorage.setItem(`oauth_token_${provider}`, token);
  
  // Définir une expiration automatique (30 minutes)
  setTimeout(() => {
    sessionStorage.removeItem(`oauth_token_${provider}`);
  }, 30 * 60 * 1000);
}

/**
 * Récupère un token OAuth stocké
 * @param provider Le fournisseur OAuth
 * @returns Le token ou null s'il n'existe pas
 */
export function getStoredOAuthToken(provider: string): string | null {
  return sessionStorage.getItem(`oauth_token_${provider}`);
}

/**
 * Supprime un token OAuth stocké
 * @param provider Le fournisseur OAuth
 */
export function clearOAuthToken(provider: string): void {
  sessionStorage.removeItem(`oauth_token_${provider}`);
}
