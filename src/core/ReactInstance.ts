
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

// Exporter React directement
export { React };

// Fonctions utilitaires pour faciliter l'utilisation
export const createContextSafely = <T>(defaultValue: T) => {
  return React.createContext(defaultValue);
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
  return true;
}
