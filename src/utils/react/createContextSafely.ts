
/**
 * Utilitaires pour la création sécurisée de contextes React
 * 
 * Ce fichier fournit des fonctions helper pour créer des contextes React
 * de manière sécurisée, en utilisant l'instance unique de React pour éviter
 * les problèmes en production liés aux instances multiples.
 */

import { React } from '@/core/ReactInstance';

/**
 * Crée un contexte React de manière sécurisée, en utilisant l'instance React unique
 * 
 * @param defaultValue - La valeur par défaut du contexte
 * @returns Le contexte React créé
 * 
 * @example
 * // Au lieu de
 * // import { createContext } from 'react';
 * // const MyContext = createContext(defaultValue);
 * 
 * // Utiliser
 * import { createContextSafely } from '@/utils/react/createContextSafely';
 * const MyContext = createContextSafely(defaultValue);
 */
export function createContextSafely<T>(defaultValue: T) {
  return React.createContext(defaultValue);
}

/**
 * Version avec un nom explicite pour la compatibilité avec le code existant
 * 
 * @param defaultValue - La valeur par défaut du contexte
 * @returns Le contexte React créé
 */
export const safeCreateContext = createContextSafely;

/**
 * Vérifie si un contexte a été créé correctement et est utilisable
 * 
 * @param context - Le contexte à vérifier
 * @returns boolean indiquant si le contexte est valide
 */
export function isContextValid<T>(context: React.Context<T>): boolean {
  // Vérifier que le contexte a les propriétés Provider et Consumer
  return Boolean(
    context &&
    typeof context === 'object' &&
    'Provider' in context &&
    'Consumer' in context
  );
}

/**
 * Crée un hook personnalisé sécurisé pour utiliser un contexte
 * 
 * @param context - Le contexte à utiliser
 * @param contextName - Le nom du contexte pour les messages d'erreur
 * @returns Une fonction hook pour utiliser le contexte en toute sécurité
 * 
 * @example
 * const MyContext = createContextSafely<MyContextType>(defaultValue);
 * export const useMyContext = createSafeContextHook(MyContext, 'MyContext');
 */
export function createSafeContextHook<T>(
  context: React.Context<T>,
  contextName: string = 'Context'
): () => T {
  return () => {
    const value = React.useContext(context);
    if (value === undefined) {
      throw new Error(`use${contextName} doit être utilisé à l'intérieur d'un ${contextName}Provider`);
    }
    return value;
  };
}
