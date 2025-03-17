
/**
 * Utilitaire pour créer des contextes React de manière sécurisée
 * 
 * Ce fichier fournit une méthode pour créer des contextes React tout en évitant
 * les erreurs liées aux instances multiples de React qui peuvent survenir en production.
 * Il inclut également des vérifications et des messages d'erreur plus clairs.
 */

import { React, createContext } from '@/core/ReactInstance';

/**
 * Crée un contexte React avec des vérifications de sécurité
 * et un hook useContext personnalisé avec vérification intégrée
 * 
 * @param defaultValue La valeur par défaut du contexte
 * @param displayName Un nom d'affichage pour le contexte (pour le débogage)
 * @returns Un objet contenant le contexte et un hook pour l'utiliser
 */
export function createContextSafely<T>(defaultValue: T, displayName: string) {
  const Context = createContext<T>(defaultValue);
  
  // Définir le nom d'affichage pour faciliter le débogage
  Context.displayName = displayName;
  
  /**
   * Hook personnalisé pour utiliser ce contexte
   * Inclut une vérification pour s'assurer que le hook est utilisé dans un Provider
   */
  const useContext = () => {
    const context = React.useContext(Context);
    
    if (context === undefined) {
      throw new Error(`useContext for ${displayName} must be used within its Provider`);
    }
    
    return context;
  };
  
  // Utilitaire pour obtenir la valeur de contexte (pour les tests)
  const getContextValue = () => {
    return defaultValue;
  };
  
  // Retourner à la fois le contexte, le hook et la fonction utilitaire
  return { Context, useContext, getContextValue };
}

/**
 * Crée un contexte React avec une valeur par défaut strictement typée
 * et des messages d'erreur plus détaillés
 * 
 * @param defaultValue Valeur par défaut du contexte
 * @param contextName Nom du contexte pour les messages d'erreur
 * @returns Le contexte React créé avec le displayName défini
 */
export function createStrictContext<T>(defaultValue: T, contextName: string) {
  const Context = createContext<T>(defaultValue);
  Context.displayName = contextName;
  
  return Context;
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
