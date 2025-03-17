
/**
 * ReactInstance.ts
 * 
 * Ce fichier exporte une instance unique de React à utiliser dans toute l'application.
 * Cela garantit que tous les composants utilisent la même instance de React,
 * évitant ainsi les problèmes de versions multiples qui peuvent survenir avec
 * le code-splitting ou des dépendances circulaires.
 * 
 * Usage:
 * import { React } from '@/core/ReactInstance';
 */

import * as React from 'react';

// Assigner React à la propriété window si elle est définie
// Cela peut aider à résoudre les problèmes d'instance en production
if (typeof window !== 'undefined') {
  window.React = React;
}

// Exporter React directement
export { React };

// Fonctions utilitaires pour faciliter l'utilisation
export const createContextSafely = <T>(defaultValue: T) => {
  try {
    if (!React || typeof React.createContext !== 'function') {
      console.error('React.createContext n\'est pas défini dans ReactInstance.ts');
      // Fallback vers window.React si disponible
      if (typeof window !== 'undefined' && window.React && typeof window.React.createContext === 'function') {
        return window.React.createContext(defaultValue);
      }
      throw new Error('Impossible de créer un contexte React');
    }
    return React.createContext(defaultValue);
  } catch (error) {
    console.error('Erreur lors de la création du contexte React:', error);
    // Création d'un contexte de secours minimal
    return {
      Provider: ({ children }: { children: any }) => children,
      Consumer: ({ children }: { children: any }) => children(defaultValue),
      displayName: 'FallbackContext'
    } as React.Context<T>;
  }
};

// Hook personnalisé pour vérifier si React est correctement chargé
export function useReactCheck() {
  const [isReactValid, setIsReactValid] = React.useState(true);
  
  React.useEffect(() => {
    try {
      // Vérifier si les hooks React fonctionnent
      const testState = React.useState(true);
      const testRef = React.useRef(null);
      
      if (!testState || !testRef) {
        console.error("Erreur de validation React: hooks non fonctionnels");
        setIsReactValid(false);
      }
    } catch (e) {
      console.error("Erreur lors de la vérification de React:", e);
      setIsReactValid(false);
    }
  }, []);
  
  return isReactValid;
}

// Exportation des hooks couramment utilisés pour garantir l'instance unique
export const {
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
  useImperativeHandle,
  useDebugValue
} = React;

/**
 * Fonction de secours pour vérifier si React est correctement chargé
 * Utile pour le débogage des problèmes d'instance React
 */
export function checkReactInstance() {
  if (!React || !React.version) {
    console.error("ERREUR CRITIQUE: React n'est pas correctement chargé");
    return false;
  }
  
  console.log(`React version ${React.version} chargé correctement`);
  
  // Vérifier si createContext est disponible
  if (typeof React.createContext !== 'function') {
    console.error("ERREUR CRITIQUE: React.createContext n'est pas disponible");
    return false;
  }
  
  return true;
}

// Interface pour le type global Window
declare global {
  interface Window {
    React?: typeof React;
  }
}
