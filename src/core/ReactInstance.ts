
/**
 * ReactInstance.ts
 * 
 * Point d'entrée unique pour React et ses hooks dans toute l'application.
 * Ce module garantit que tous les composants utilisent la même instance de React,
 * ce qui évite les problèmes liés à l'existence de plusieurs instances
 * qui peuvent survenir avec le code-splitting ou les dépendances circulaires.
 */

import * as ReactOriginal from 'react';

// Exporter l'instance unique de React
export const React = ReactOriginal;

// Exporter tous les hooks et fonctions de React
export const {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
  useReducer,
  useLayoutEffect,
  useImperativeHandle,
  useDebugValue,
  useDeferredValue,
  useTransition,
  useId,
  createContext,
  forwardRef,
  memo,
  Fragment,
  Suspense,
  lazy,
  createElement,
  cloneElement,
  isValidElement,
  Children
} = ReactOriginal;

// Vérifier si React est correctement chargé
export function checkReactInstance() {
  if (!React || !React.version) {
    console.error("ERREUR CRITIQUE: React n'est pas correctement chargé");
    return false;
  }
  
  console.log(`React version ${React.version} chargé correctement`);
  return true;
}

// Assigner React à la propriété window si elle est définie
// Cela peut aider à résoudre les problèmes d'instance en production
if (typeof window !== 'undefined') {
  window.React = React;
}

// Interface pour le type global Window
declare global {
  interface Window {
    React?: typeof React;
  }
}

/**
 * Crée un contexte React avec validation et messages d'erreur améliorés.
 * Cette fonction remplace l'approche complexe précédente par une implémentation plus directe.
 * 
 * @param defaultValue Valeur par défaut du contexte
 * @param displayName Nom d'affichage pour le débogage
 * @returns Objet contexte et hook personnalisé
 */
export function createSafeContext<T>(defaultValue: T, displayName: string) {
  const Context = createContext<T>(defaultValue);
  Context.displayName = displayName;
  
  // Hook personnalisé avec vérification d'utilisation
  const useContextSafely = () => {
    const context = useContext(Context);
    
    if (context === undefined) {
      throw new Error(`Le hook useContext pour ${displayName} doit être utilisé à l'intérieur d'un Provider`);
    }
    
    return context;
  };
  
  return { Context, useContext: useContextSafely };
}
