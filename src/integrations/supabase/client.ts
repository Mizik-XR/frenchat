
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config';
import { 
  APP_STATE, 
  detectLocalAIService,
  checkOfflineMode,
  preloadSession as compatPreloadSession
} from '@/compatibility/supabaseCompat';
import { UserProfile, EdgeFunctionResponse } from './supabaseModels';

// Create client with error handling
let supabaseClient: any = null;

try {
  // Vérifier si on devrait utiliser le mode hors ligne
  checkOfflineMode();
  
  if (APP_STATE.isOfflineMode) {
    console.warn("Application en mode hors ligne, client Supabase non initialisé");
  } else {
    // Create client with optimized options
    supabaseClient = createClient<Database>(
      SUPABASE_URL, 
      SUPABASE_PUBLISHABLE_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'supabase.auth.token'
        },
        global: {
          fetch: (...args) => {
            // Handle fetch arguments properly
            const request = args[0];
            const options = args[1] || {};
            
            // Conditional cache options
            const updatedOptions = {
              ...options,
              cache: request.toString().includes('auth/') ? 'no-cache' : 'default'
            };
            
            return fetch(request, updatedOptions);
          }
        }
      }
    );
    console.log("Client Supabase initialized successfully");
  }
} catch (error) {
  console.error("CRITICAL ERROR: Failed to initialize Supabase client:", error);
  if (error instanceof Error) {
    APP_STATE.logSupabaseError(error);
  }
  supabaseClient = null;
  APP_STATE.setOfflineMode(true);
}

// Export Supabase client and utilities
export const supabase = supabaseClient;

// Réexportation des constantes d'APP_STATE pour maintenir la compatibilité API
export { APP_STATE, checkOfflineMode, detectLocalAIService };

// Utilisation de la fonction de compatibilité
export const preloadSession = compatPreloadSession;

// Réexporte le type EdgeFunctionResponse pour qu'il soit disponible aux imports
export type { EdgeFunctionResponse };

// Importer les utilitaires de profil après l'export de supabase
// Ceci évite la dépendance circulaire
import { handleProfileQuery, checkSupabaseConnection } from './profileUtils';
export { handleProfileQuery, checkSupabaseConnection };

// Tester la validation des paramètres Supabase
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("ERREUR CRITIQUE: Configuration Supabase manquante!");
  if (typeof window !== 'undefined') {
    // Afficher une alerte dans la console du navigateur
    console.error(
      "%c⚠️ ERREUR DE CONFIGURATION SUPABASE ⚠️",
      "background: #f44336; color: white; font-size: 16px; padding: 8px;"
    );
    console.error(
      "%cURL Supabase ou clé d'API manquante. Vérifiez votre configuration.",
      "font-size: 14px;"
    );
  }
}

// Preload session if we're in a browser
if (typeof window !== 'undefined') {
  // Non-blocking preload
  setTimeout(() => {
    preloadSession().catch(err => {
      console.warn("Session preload failed:", err);
    });
  }, 0);
  
  // Local AI service detection
  setTimeout(() => {
    detectLocalAIService().catch(err => {
      console.warn("Local AI service detection failed:", err);
    });
  }, 1000);
}
