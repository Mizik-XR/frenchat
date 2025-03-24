/**
 * MODULE DE COMPATIBILITÉ GLOBAL
 * 
 * Ce fichier sert de point d'entrée unique pour toutes les fonctionnalités
 * qui étaient auparavant importées de multiples sources, créant des dépendances circulaires.
 * 
 * IMPORTANT: Ce module est une solution temporaire pour stabiliser l'application.
 * Une refactorisation plus propre devra être envisagée ultérieurement.
 */

/**
 * Module de compatibilité Supabase
 * 
 * Ce module fournit des couches de compatibilité pour faciliter la migration
 * entre différentes versions de l'API Supabase ou pour supporter des modes
 * de fonctionnement spécifiques (mode hors ligne, test, etc.)
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Déclaration pour gtag global
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: object) => void;
  }
}

/**
 * Classe qui représente l'état global de l'application
 * Utilisée pour maintenir la compatibilité avec le code existant
 */
export class CompatAppState {
  private _errorLog: Error[] = [];
  private _isOffline: boolean = false;
  
  constructor() {
    this._isOffline = false;
  }
  
  public isOfflineMode(): boolean {
    return this._isOffline;
  }
  
  public setOfflineMode(value: boolean): void {
    this._isOffline = value;
    // Synchroniser avec localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('OFFLINE_MODE', value.toString());
    }
  }
  
  public logSupabaseError(error: Error): void {
    console.error('[Supabase Error]:', error);
    this._errorLog.push(error);
    
    // Si nécessaire, journaliser l'erreur vers un service d'analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'supabase_error', {
        error_message: error.message,
        error_stack: error.stack
      });
    }
  }
  
  public getErrorLog(): Error[] {
    return [...this._errorLog];
  }
  
  public clearErrorLog(): void {
    this._errorLog = [];
  }
}

// Singleton APP_STATE pour la compatibilité
export const APP_STATE = new CompatAppState();

// Créer le client Supabase
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Fonctions utilitaires de compatibilité
 */

// Vérifier si nous sommes en mode hors ligne
export const checkOfflineMode = (): boolean => {
  // Vérifier localStorage
  if (typeof window !== 'undefined') {
    const storedOfflineMode = localStorage.getItem('OFFLINE_MODE');
    if (storedOfflineMode === 'true') {
      APP_STATE.setOfflineMode(true);
    }
    
    // Vérifier l'état de la connexion réseau
    if (!navigator.onLine) {
      console.log('[Compat] Pas de connexion réseau, activation du mode hors ligne');
      APP_STATE.setOfflineMode(true);
    }
  }
  
  return APP_STATE.isOfflineMode;
};

// Encapsuler les requêtes pour une gestion cohérente du mode hors ligne
export async function handleProfileQuery(userId: string) {
  if (APP_STATE.isOfflineMode()) {
    console.log("Mode hors ligne actif, utilisation d'un profil par défaut");
    return { 
      data: { 
        id: userId,
        is_first_login: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, 
      error: null 
    };
  }
  
  try {
    // Utiliser le nouveau service centralisé
    return await supabase.from('profiles').select('*').eq('id', userId);
  } catch (error) {
    APP_STATE.logSupabaseError(error as Error);
    return { data: null, error };
  }
}

export function isOfflineMode(): boolean {
  return APP_STATE.isOfflineMode();
}
