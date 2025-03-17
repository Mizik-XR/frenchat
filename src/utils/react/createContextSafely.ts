
/**
 * Utilitaires pour la création sécurisée de contextes React
 * 
 * Ce fichier fournit des fonctions helper pour créer des contextes React
 * de manière sécurisée, en utilisant l'instance unique de React.
 */

import { React, createContext } from '@/core/ReactInstance';

/**
 * Crée un contexte React de manière sécurisée, en utilisant l'instance React unique
 * 
 * @param defaultValue - La valeur par défaut du contexte
 * @param displayName - Nom optionnel pour le contexte (utile pour le debugging)
 * @returns Le contexte React créé
 */
export function createContextSafely<T>(defaultValue: T, displayName?: string) {
  const context = createContext<T>(defaultValue);
  if (displayName) {
    context.displayName = displayName;
  }
  return context;
}

/**
 * Fonction pour obtenir la valeur actuelle d'un contexte en toute sécurité
 * Utile lorsque useContext n'est pas disponible
 */
export function getContextValue<T>(context: React.Context<T>): T {
  try {
    // Tenter d'accéder à la valeur actuelle via les propriétés internes
    return (context as any)._currentValue || context.defaultValue;
  } catch (err) {
    console.error('Erreur lors de l\'accès à la valeur du contexte:', err);
    // Retourner la valeur par défaut en cas d'échec
    return context.defaultValue;
  }
}

/**
 * Version avec un nom explicite pour la compatibilité avec le code existant
 */
export const safeCreateContext = createContextSafely;

/**
 * Vérifie si un contexte a été créé correctement et est utilisable
 */
export function isContextValid<T>(context: React.Context<T>): boolean {
  return Boolean(
    context &&
    typeof context === 'object' &&
    'Provider' in context &&
    'Consumer' in context
  );
}

/**
 * Crée un hook personnalisé sécurisé pour utiliser un contexte
 */
export function createSafeContextHook<T>(
  context: React.Context<T>,
  contextName: string = 'Context'
): () => T {
  return () => {
    try {
      const value = React.useContext(context);
      if (value === undefined) {
        throw new Error(`use${contextName} doit être utilisé à l'intérieur d'un ${contextName}Provider`);
      }
      return value;
    } catch (err) {
      console.error(`Erreur lors de l'utilisation du contexte ${contextName}:`, err);
      return getContextValue(context);
    }
  };
}
