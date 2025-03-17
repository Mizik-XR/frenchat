
/**
 * Utilitaire simplifié pour créer des contextes React de manière sécurisée
 * 
 * Ce module utilise l'approche standardisée du module ReactInstance pour créer
 * des contextes React. Il fournit une interface simplifiée qui garantit
 * des vérifications et des messages d'erreur clairs.
 */

import { createSafeContext, React } from '@/core/ReactInstance';

// Re-exporter la fonction depuis ReactInstance
export const createContextSafely = createSafeContext;

/**
 * Fonction utilitaire pour obtenir la valeur d'un contexte avec une valeur par défaut
 * 
 * @param context Le contexte React
 * @param defaultValue Valeur par défaut à utiliser si le contexte est undefined
 * @returns La valeur du contexte ou la valeur par défaut
 * @deprecated Utilisez plutôt createContextSafely et son hook useContext
 */
export function getContextValue<T>(context: React.Context<T>, defaultValue: T): T {
  console.warn('getContextValue est déconseillé, utilisez plutôt createContextSafely');
  // Tenter d'accéder à la valeur actuelle du contexte (si disponible)
  // Sinon, retourner la valeur par défaut
  try {
    const value = (context as any)._currentValue;
    return value !== undefined ? value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

/**
 * Vérifie si un hook de contexte est utilisé dans un Provider
 * 
 * @param context La valeur retournée par useContext
 * @param contextName Le nom du contexte pour l'erreur
 */
export function validateContextHook<T>(context: T | undefined, contextName: string): asserts context is T {
  if (context === undefined) {
    throw new Error(`Le hook ${contextName} doit être utilisé dans un ${contextName}Provider`);
  }
}
