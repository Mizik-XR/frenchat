
/**
 * État global de l'application pour Supabase
 * 
 * Ce fichier centralise l'état lié à Supabase pour éviter les dépendances circulaires
 * et permettre un partage sécurisé entre les composants.
 */

import { APP_STATE } from '@/compatibility/supabaseCompat';
import { initializeAppState } from './sessionManager';

/**
 * Ce fichier utilise désormais le module de compatibilité global
 * pour éviter les dépendances circulaires.
 * 
 * L'implémentation originale a été déplacée dans src/compatibility/supabaseCompat.ts
 */

// Pour maintenir la compatibilité, nous réexportons APP_STATE du module de compatibilité
export { APP_STATE };

// Fonction pour détecter le service d'IA local
export const detectLocalAIService = async () => {
  // Utiliser l'implémentation du module de compatibilité
  // Vérification de l'existence de la fonction dans APP_STATE
  if (typeof APP_STATE.detectLocalAIService === 'function') {
    return APP_STATE.detectLocalAIService();
  }
  return { available: false, message: "Non disponible (module de compatibilité)" };
};

// Initialiser la référence dans sessionManager pour éviter la dépendance circulaire
// Cette ligne est maintenue pour la compatibilité, mais n'a plus d'effet réel
initializeAppState({
  isOfflineMode: APP_STATE.isOfflineMode,
  setOfflineMode: (value) => APP_STATE.setOfflineMode(value),
  logSupabaseError: (error) => APP_STATE.logSupabaseError(error)
});
