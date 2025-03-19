
/**
 * Utilitaires pour la gestion du mode cloud/hors ligne
 * 
 * Ce fichier fournit des fonctions pour gérer les paramètres de mode cloud et hors ligne
 * de l'application, y compris la détection et le changement de mode.
 */

import { isLovableEnvironment } from './environmentDetection';
import { APP_STATE } from '@/compatibility/supabaseCompat';

/**
 * Active ou désactive le mode hors ligne
 * @param enable True pour activer le mode hors ligne, False pour le désactiver
 */
export function setOfflineMode(enable: boolean): void {
  APP_STATE.setOfflineMode(enable);
}

/**
 * Vérifie si le mode hors ligne est actuellement actif
 * @returns True si le mode hors ligne est actif
 */
export function isOfflineMode(): boolean {
  return APP_STATE.isOfflineMode;
}

/**
 * Basculer entre les modes en ligne et hors ligne
 * @returns Le nouveau statut du mode hors ligne (true si activé, false si désactivé)
 */
export function toggleOfflineMode(): boolean {
  const newState = !APP_STATE.isOfflineMode;
  APP_STATE.setOfflineMode(newState);
  return newState;
}

/**
 * Obtient l'URL de base de l'API en fonction de l'environnement
 * @returns L'URL de base de l'API
 */
export function getApiBaseUrl(): string {
  // Vérifier les variables d'environnement
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Dans l'environnement Lovable, utiliser une URL par défaut
  if (isLovableEnvironment()) {
    return 'https://api.frenchat.io';
  }
  
  // En développement local, utiliser localhost
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:8000';
  }
  
  // Fallback pour la production
  return 'https://api.frenchat.io';
}

/**
 * Détecte si Supabase devrait être utilisé dans l'environnement actuel
 * @returns True si Supabase devrait être utilisé
 */
export function shouldUseSupabase(): boolean {
  // Vérification des paramètres d'URL
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const forceOnline = urlParams.get('forceOnline') === 'true';
    
    if (forceOnline) {
      return true;
    }
    
    const forceOffline = urlParams.get('forceOffline') === 'true';
    if (forceOffline) {
      return false;
    }
  }
  
  // Dans l'environnement Lovable, vérifier le paramètre spécifique
  if (isLovableEnvironment()) {
    return typeof window !== 'undefined' && 
           localStorage.getItem('ENABLE_SUPABASE_IN_LOVABLE') === 'true';
  }
  
  // Dans les autres environnements, utiliser Supabase sauf si le mode hors ligne est actif
  return !APP_STATE.isOfflineMode;
}

/**
 * Enregistre les préférences de mode pour l'environnement Lovable
 * @param enableSupabase Activer Supabase dans l'environnement Lovable
 * @param enableLocalAI Activer l'IA locale dans l'environnement Lovable
 */
export function setLovableEnvironmentPreferences(enableSupabase: boolean, enableLocalAI: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ENABLE_SUPABASE_IN_LOVABLE', enableSupabase ? 'true' : 'false');
    localStorage.setItem('ENABLE_LOCAL_AI_IN_LOVABLE', enableLocalAI ? 'true' : 'false');
    
    // Si nous activons Supabase, désactiver le mode hors ligne
    if (enableSupabase) {
      APP_STATE.setOfflineMode(false);
    }
  }
}

/**
 * Obtient les préférences actuelles pour l'environnement Lovable
 * @returns Un objet contenant les préférences pour Supabase et l'IA locale
 */
export function getLovableEnvironmentPreferences(): { enableSupabase: boolean, enableLocalAI: boolean } {
  if (typeof window !== 'undefined') {
    return {
      enableSupabase: localStorage.getItem('ENABLE_SUPABASE_IN_LOVABLE') === 'true',
      enableLocalAI: localStorage.getItem('ENABLE_LOCAL_AI_IN_LOVABLE') === 'true'
    };
  }
  
  return { enableSupabase: false, enableLocalAI: false };
}
