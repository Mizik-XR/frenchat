
// Import functions from the new module structure
import {
  isLovableEnvironment as isLovableEnv,
  isNetlifyEnvironment as isNetlifyEnv,
  isProduction as isProd,
  isDevelopment as isDev,
  getAllUrlParams as getUrlParams,
  getBaseUrl as getBaseUrlUtil,
  getFormattedUrlParams as getFormattedParamsString,
  getRedirectUrl as getRedirectUrlUtil
} from '@/utils/environment';

/**
 * Vérifie si l'application est en mode production
 * @deprecated Utilisez import { isProduction } from '@/utils/environment' à la place
 */
export function isProduction(): boolean {
  return isProd();
}

/**
 * Vérifie si l'application est en mode développement
 * @deprecated Utilisez import { isDevelopment } from '@/utils/environment' à la place
 */
export function isDevelopment(): boolean {
  return isDev();
}

/**
 * Vérifie si l'application est dans l'environnement Lovable
 * @deprecated Utilisez import { isLovableEnvironment } from '@/utils/environment' à la place
 */
export function isLovableEnvironment(): boolean {
  return isLovableEnv();
}

/**
 * Vérifie si l'application est dans l'environnement Netlify
 * @deprecated Utilisez import { isNetlifyEnvironment } from '@/utils/environment' à la place
 */
export function isNetlifyEnvironment(): boolean {
  return isNetlifyEnv();
}

/**
 * Vérifie si le mode client est activé via les paramètres d'URL
 */
export function isClientMode(): boolean {
  const urlParams = getUrlParams();
  return urlParams.client === 'true';
}

/**
 * Vérifie si le mode debug est activé via les paramètres d'URL
 */
export function isDebugMode(): boolean {
  const urlParams = getUrlParams();
  return urlParams.debug === 'true' && !urlParams.hideDebug;
}

/**
 * Vérifie si le mode cloud est forcé via les paramètres d'URL ou les variables d'environnement
 */
export function isCloudModeForced(): boolean {
  const urlParams = getUrlParams();
  return urlParams.forceCloud === 'true' || import.meta.env.VITE_FORCE_CLOUD_MODE === 'true';
}

/**
 * Obtient l'URL de base de l'application
 * @deprecated Utilisez import { getBaseUrl } from '@/utils/environment' à la place
 */
export function getBaseUrl(): string {
  return getBaseUrlUtil();
}

/**
 * Construit une URL de redirection complète
 * @param path Chemin relatif à ajouter à l'URL de base
 * @deprecated Utilisez import { getRedirectUrl } from '@/utils/environment' à la place
 */
export function getRedirectUrl(path: string): string {
  return getRedirectUrlUtil(path);
}

/**
 * Formate les paramètres d'URL
 * @deprecated Utilisez import { getFormattedUrlParams } from '@/utils/environment' à la place
 * @returns Une chaîne formatée de paramètres d'URL (commençant par '?' si des paramètres sont présents)
 */
export function getFormattedUrlParams(): string {
  return getFormattedParamsString();
}

/**
 * Récupère tous les paramètres d'URL
 * @deprecated Utilisez import { getAllUrlParams } from '@/utils/environment' à la place
 */
export function getAllUrlParams(): Record<string, string> {
  return getUrlParams();
}
