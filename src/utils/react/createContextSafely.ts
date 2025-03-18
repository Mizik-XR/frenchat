
/**
 * Utilitaire pour créer des contextes React de manière sécurisée
 * 
 * Ce fichier fournit une méthode pour créer des contextes React tout en évitant
 * les erreurs liées aux instances multiples de React qui peuvent survenir en production.
 * Il inclut également des vérifications et des messages d'erreur plus clairs.
 */

import { React, createContext } from '@/core/ReactInstance';

/**
 * Fonction de secours pour créer un contexte minimal en cas d'erreur
 */
function createFallbackContext<T>(defaultValue: T, displayName: string) {
  console.warn(`Création d'un contexte de secours pour ${displayName}`);
  
  // Créer un objet qui simule un contexte React
  const fallbackContext = {
    Provider: ({ children, value }: { children: any, value?: T }) => {
      // Stocker la dernière valeur fournie
      (fallbackContext as any)._currentValue = value !== undefined ? value : defaultValue;
      return children;
    },
    Consumer: ({ children }: { children: (value: T) => any }) => {
      // Utiliser la dernière valeur stockée ou la valeur par défaut
      return children((fallbackContext as any)._currentValue || defaultValue);
    },
    displayName: displayName,
    _currentValue: defaultValue
  };
  
  return fallbackContext;
}

/**
 * Crée un contexte React avec des vérifications de sécurité
 * et un hook useContext personnalisé avec vérification intégrée
 * 
 * @param defaultValue La valeur par défaut du contexte
 * @param displayName Un nom d'affichage pour le contexte (pour le débogage)
 * @returns Un objet contenant le contexte et un hook pour l'utiliser
 */
export function createContextSafely<T>(defaultValue: T, displayName: string) {
  let Context;
  
  try {
    // Vérifier si createContext est disponible
    if (!createContext) {
      throw new Error('React.createContext n\'est pas disponible');
    }
    
    // Utiliser le createContext importé de ReactInstance
    Context = createContext(defaultValue);
    
    // Définir le nom d'affichage pour faciliter le débogage
    if (Context) {
      Context.displayName = displayName;
    }
  } catch (error) {
    console.error(`Erreur lors de la création du contexte ${displayName}:`, error);
    // En cas d'erreur, utiliser un contexte de secours
    Context = createFallbackContext(defaultValue, displayName);
  }
  
  /**
   * Hook personnalisé pour utiliser ce contexte
   * Inclut une vérification pour s'assurer que le hook est utilisé dans un Provider
   */
  const useContext = () => {
    // Vérifier que React est disponible
    if (!React || !React.useContext) {
      console.warn(`React.useContext n'est pas disponible lors de l'utilisation de ${displayName}`);
      // Retourner la valeur par défaut en cas d'erreur
      return (Context as any)?._currentValue || defaultValue;
    }
    
    try {
      const context = React.useContext(Context);
      
      // Si le contexte est undefined, c'est probablement parce que le hook est utilisé
      // en dehors d'un Provider. Retournons la valeur par défaut dans ce cas.
      if (context === undefined) {
        console.warn(`useContext pour ${displayName} utilisé en dehors de son Provider`);
        return defaultValue;
      }
      
      return context;
    } catch (error) {
      console.error(`Erreur lors de l'utilisation du contexte ${displayName}:`, error);
      return defaultValue;
    }
  };
  
  // Utilitaire pour obtenir la valeur de contexte (pour les tests)
  const getContextValue = () => {
    try {
      return (Context as any)?._currentValue || defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };
  
  // Retourner à la fois le contexte, le hook et la fonction utilitaire
  return { Context, useContext, getContextValue };
}

/**
 * Fonction utilitaire pour obtenir la valeur d'un contexte avec une valeur par défaut
 * 
 * Cette fonction est utile pour les cas où un composant pourrait être utilisé en dehors
 * de son Provider, fournissant une valeur de secours sécurisée.
 * 
 * @param context Le contexte React
 * @param defaultValue Valeur par défaut à utiliser si le contexte est undefined
 * @returns La valeur du contexte ou la valeur par défaut
 */
export function getContextValue<T>(context: React.Context<T>, defaultValue: T): T {
  console.warn('getContextValue est déconseillé, utilisez plutôt useContextSafely');
  // Tenter d'accéder à la valeur actuelle du contexte (si disponible)
  // Sinon, retourner la valeur par défaut
  try {
    if (!context) return defaultValue;
    
    const value = (context as any)._currentValue;
    return value !== undefined ? value : defaultValue;
  } catch (e) {
    return defaultValue;
  }
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
  let Context;
  
  try {
    Context = createContext(defaultValue);
    if (Context) {
      Context.displayName = contextName;
    }
  } catch (error) {
    console.error(`Erreur lors de la création du contexte strict ${contextName}:`, error);
    Context = createFallbackContext(defaultValue, contextName);
  }
  
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
    console.error(`Le hook ${contextName} doit être utilisé dans un ${contextName}Provider`);
    throw new Error(`Le hook ${contextName} doit être utilisé dans un ${contextName}Provider`);
  }
}
