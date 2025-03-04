
import { isLovableEnvironment, isNetlifyEnvironment, isProduction, isDevelopment } from '@/utils/environment';
import { getAllUrlParams, getBaseUrl, getFormattedUrlParams, getRedirectUrl } from '@/utils/environment';

// Cette version refactorisée du fichier environmentUtils.ts
// maintient la compatibilité avec le code existant
// tout en utilisant la nouvelle structure modulaire des utilitaires d'environnement

/**
 * Vérifie si l'application est en mode production
 * @deprecated Utilisez import { isProduction } from '@/utils/environment' à la place
 */
export function isProduction(): boolean {
  return isProduction();
}

/**
 * Vérifie si l'application est en mode développement
 * @deprecated Utilisez import { isDevelopment } from '@/utils/environment' à la place
 */
export function isDevelopment(): boolean {
  return isDevelopment();
}

/**
 * Vérifie si l'application est dans l'environnement Lovable
 * @deprecated Utilisez import { isLovableEnvironment } from '@/utils/environment' à la place
 */
export function isLovableEnvironment(): boolean {
  return isLovableEnvironment();
}

/**
 * Vérifie si l'application est dans l'environnement Netlify
 * @deprecated Utilisez import { isNetlifyEnvironment } from '@/utils/environment' à la place
 */
export function isNetlifyEnvironment(): boolean {
  return isNetlifyEnvironment();
}

/**
 * Vérifie si le mode client est activé via les paramètres d'URL
 */
export function isClientMode(): boolean {
  const urlParams = getAllUrlParams();
  return urlParams.client === 'true';
}

/**
 * Vérifie si le mode debug est activé via les paramètres d'URL
 */
export function isDebugMode(): boolean {
  const urlParams = getAllUrlParams();
  return urlParams.debug === 'true' && !urlParams.hideDebug;
}

/**
 * Vérifie si le mode cloud est forcé via les paramètres d'URL ou les variables d'environnement
 */
export function isCloudModeForced(): boolean {
  const urlParams = getAllUrlParams();
  return urlParams.forceCloud === 'true' || import.meta.env.VITE_FORCE_CLOUD_MODE === 'true';
}

/**
 * Obtient l'URL de base de l'application
 * @deprecated Utilisez import { getBaseUrl } from '@/utils/environment' à la place
 */
export function getBaseUrl(): string {
  return getBaseUrl();
}

/**
 * Construit une URL de redirection complète
 * @param path Chemin relatif à ajouter à l'URL de base
 * @deprecated Utilisez import { getRedirectUrl } from '@/utils/environment' à la place
 */
export function getRedirectUrl(path: string): string {
  return getRedirectUrl(path);
}

/**
 * Formate les paramètres d'URL
 * @deprecated Utilisez import { getFormattedUrlParams } from '@/utils/environment' à la place
 */
export function getFormattedUrlParams(): Record<string, string> {
  return getFormattedUrlParams();
}

/**
 * Récupère tous les paramètres d'URL
 * @deprecated Utilisez import { getAllUrlParams } from '@/utils/environment' à la place
 */
export function getAllUrlParams(): Record<string, string> {
  return getAllUrlParams();
}
