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

import { supabaseService, supabase } from '@/services/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
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
class CompatAppState {
  private _errorLog: Error[] = [];
  
  // Proxy vers le service centralisé
  get isOfflineMode(): boolean {
    return supabaseService.connectivity.isOfflineMode;
  }
  
  setOfflineMode(value: boolean): void {
    supabaseService.connectivity.setOfflineMode(value);
  }
  
  // Fonctions de journalisation d'erreurs pour le débogage
  logSupabaseError(error: Error): void {
    console.error('[Supabase Error]', error);
    this._errorLog.push(error);
    
    // Si nécessaire, journaliser l'erreur vers un service d'analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'supabase_error', {
        error_message: error.message,
        error_stack: error.stack
      });
    }
  }
  
  getErrorLog(): Error[] {
    return [...this._errorLog];
  }
  
  clearErrorLog(): void {
    this._errorLog = [];
  }
}

// Singleton APP_STATE pour la compatibilité
export const APP_STATE = new CompatAppState();

/**
 * Type générique pour éviter les erreurs de type avec les noms de table dynamiques
 */
export function createCompatClient(baseClient: SupabaseClient<Database>) {
  return {
    ...baseClient,
    
    // Ajouts pour la compatibilité v1.x
    compat: {
      version: '2.x',
      
      auth: {
        ...baseClient.auth,
        // Méthodes v1.x
        user: () => baseClient.auth.getUser().then(({ data }) => data.user),
        session: () => baseClient.auth.getSession().then(({ data }) => data.session),
        signIn: (credentials: any) => baseClient.auth.signInWithPassword(credentials),
        signOut: () => baseClient.auth.signOut()
      },
      
      // Méthodes pour récupérer des données avec syntaxe v1.x
      from: (table: string) => {
        // Utiliser any ici pour permettre l'utilisation dynamique des noms de table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const modernQuery = (baseClient.from as any)(table);
        
        return {
          ...modernQuery,
          // v1.x style: client.from('table').get()
          get: () => modernQuery.select('*'),
          // Autres méthodes de compatibilité...
        };
      }
    }
  };
}

// Client avec compatibilité
export const supabaseCompat = createCompatClient(supabase);

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
  if (APP_STATE.isOfflineMode) {
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
    return await supabaseService.profiles.getProfile(userId);
  } catch (error) {
    APP_STATE.logSupabaseError(error as Error);
    return { data: null, error };
  }
}
