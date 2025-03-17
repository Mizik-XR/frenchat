
/**
 * Utilitaires pour la création sécurisée de contextes React
 * 
 * Ce fichier fournit des fonctions helper pour créer des contextes React
 * de manière sécurisée, en utilisant l'instance unique de React.
 */

import { React } from '@/core/ReactInstance';

/**
 * Interface pour le résultat de createContextSafely
 */
export interface SafeContext<T> {
  Context: React.Context<T>;
  Provider: React.Provider<T>;
  Consumer: React.Consumer<T>;
  useContext: () => T;
}

/**
 * Crée un contexte React de manière sécurisée, en utilisant l'instance React unique
 * 
 * @param defaultValue - La valeur par défaut du contexte
 * @param displayName - Nom optionnel pour le contexte (utile pour le debugging)
 * @returns Un objet contenant le contexte et des méthodes sécurisées pour l'utiliser
 */
export function createContextSafely<T>(defaultValue: T, displayName?: string): SafeContext<T> {
  const context = React.createContext<T>(defaultValue);
  
  if (displayName) {
    context.displayName = displayName;
  }
  
  // Fonction sécurisée pour obtenir la valeur du contexte
  const useContextSafely = () => {
    const value = React.useContext(context);
    if (value === undefined) {
      return defaultValue; // Retourne la valeur par défaut si le contexte n'est pas trouvé
    }
    return value;
  };
  
  return {
    Context: context,
    Provider: context.Provider,
    Consumer: context.Consumer,
    useContext: useContextSafely
  };
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
 * Fonction pour obtenir la valeur actuelle d'un contexte en toute sécurité
 * Utile lorsque useContext n'est pas disponible
 */
export function getContextValue<T>(context: React.Context<T>, fallbackValue?: T): T {
  try {
    // Utiliser le hook useContext si possible
    if (typeof React.useContext === 'function') {
      const value = React.useContext(context);
      return value !== undefined ? value : (fallbackValue as T);
    }
    
    // Fallback: tenter d'accéder à la propriété interne _currentValue
    // Ceci est un hack et pourrait ne pas fonctionner dans toutes les versions de React
    const currentValue = (context as any)._currentValue;
    return currentValue !== undefined ? currentValue : (fallbackValue as T);
  } catch (err) {
    console.error('Erreur lors de l\'accès à la valeur du contexte:', err);
    return fallbackValue as T;
  }
}

/**
 * Crée un hook personnalisé sécurisé pour utiliser un contexte
 */
export function createSafeContextHook<T>(
  context: React.Context<T>,
  fallbackValue: T,
  contextName: string = 'Context'
): () => T {
  return () => {
    try {
      const value = React.useContext(context);
      if (value === undefined) {
        console.warn(`use${contextName} doit être utilisé à l'intérieur d'un ${contextName}Provider`);
        return fallbackValue;
      }
      return value;
    } catch (err) {
      console.error(`Erreur lors de l'utilisation du contexte ${contextName}:`, err);
      return fallbackValue;
    }
  };
}
