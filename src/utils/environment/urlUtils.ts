
/**
 * Utilitaires pour la gestion des URLs et des paramètres
 */

import { isLovableEnvironment } from './environmentDetection';

/**
 * Récupère l'URL de base de l'application
 * @returns L'URL de base incluant le protocole et le hostname
 */
export function getBaseUrl(): string {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_SITE_URL || 'http://localhost:8080';
  }
  
  // Utiliser l'URL actuelle si nous sommes dans un navigateur
  const protocol = window.location.protocol;
  const host = window.location.host;
  return `${protocol}//${host}`;
}

/**
 * Construit une URL de redirection complète
 * @param path Chemin relatif à ajouter à l'URL de base
 * @returns URL complète pour la redirection
 */
export function getRedirectUrl(path: string): string {
  return `${getBaseUrl()}/${path.startsWith('/') ? path.substring(1) : path}`;
}

/**
 * Récupère tous les paramètres d'URL
 * @returns Un objet avec tous les paramètres d'URL
 */
export function getAllUrlParams(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  const urlParams = new URLSearchParams(window.location.search);
  const params: Record<string, string> = {};
  
  urlParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Formate les paramètres d'URL en une chaîne
 * @returns Une chaîne formatée de paramètres d'URL (commençant par '?' si des paramètres sont présents)
 */
export function getFormattedUrlParams(): string {
  if (typeof window === 'undefined') return '';
  
  const search = window.location.search;
  return search || '';
}

/**
 * Vérifie si une URL est accessible
 * @param url L'URL à vérifier
 * @returns Une promesse qui se résout à true si l'URL est accessible, false sinon
 */
export async function isUrlAccessible(url: string): Promise<boolean> {
  try {
    // Utiliser un AbortController pour limiter le temps d'attente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    // Tenter d'accéder à l'URL
    const response = await fetch(url, { 
      method: 'HEAD', 
      mode: 'no-cors',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Construit l'URL de la console Supabase
 * @param projectId ID du projet Supabase
 * @returns URL complète de la console
 */
export function buildSupabaseConsoleUrl(projectId: string): string {
  return `https://supabase.com/dashboard/project/${projectId}`;
}

// Exporter également la fonction isLovableEnvironment pour éviter une dépendance circulaire
export { isLovableEnvironment };
