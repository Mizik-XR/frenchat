
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
  try {
    // Vérifier que React est correctement défini
    if (!React || typeof React.createContext !== 'function') {
      console.error('Erreur critique: React.createContext n\'est pas disponible');
      
      // Fallback pour la production - utiliser window.React si disponible
      // Cela peut aider à récupérer dans certains cas où l'importation échoue
      if (typeof window !== 'undefined' && window.React && typeof window.React.createContext === 'function') {
        console.warn('Utilisation du fallback window.React.createContext');
        return window.React.createContext(defaultValue);
      }
      
      // Si aucune solution n'est disponible, utiliser un contexte React standard avec des valeurs par défaut
      // Cela évite les problèmes de typage tout en fournissant un fallback
      return React.createContext(defaultValue);
    }
    
    return React.createContext(defaultValue);
  } catch (err) {
    console.error('Erreur lors de la création du contexte:', err);
    
    // En cas d'erreur, utiliser le contexte standard avec une valeur par défaut
    // pour éviter les problèmes de typage
    return React.createContext(defaultValue);
  }
}

/**
 * Fonction pour obtenir la valeur actuelle d'un contexte en toute sécurité
 * Utile lorsque useContext n'est pas disponible
 */
export function getContextValue<T>(context: React.Context<T>): T {
  try {
    // Tenter d'accéder à la valeur actuelle via les propriétés internes
    // Note: ceci est une implémentation de secours et non recommandée
    return (context as any)._currentValue || (context as any).defaultValue;
  } catch (err) {
    console.error('Erreur lors de l\'accès à la valeur du contexte:', err);
    // Retourner undefined en cas d'échec
    return undefined as any;
  }
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
    try {
      if (!React || typeof React.useContext !== 'function') {
        console.error(`Erreur critique: React.useContext n'est pas disponible pour ${contextName}`);
        // Retourner une valeur par défaut pour éviter les erreurs
        return getContextValue(context);
      }
      
      const value = React.useContext(context);
      if (value === undefined) {
        throw new Error(`use${contextName} doit être utilisé à l'intérieur d'un ${contextName}Provider`);
      }
      return value;
    } catch (err) {
      console.error(`Erreur lors de l'utilisation du contexte ${contextName}:`, err);
      // Retourner une valeur par défaut pour éviter les erreurs fatales
      return getContextValue(context);
    }
  };
}

// Définir React global pour la récupération d'urgence
if (typeof window !== 'undefined' && !window.React && React) {
  window.React = React;
}

// Interface pour le type global Window
declare global {
  interface Window {
    React?: typeof React;
  }
}
