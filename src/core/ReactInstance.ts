
/**
 * ReactInstance.ts
 * 
 * Ce fichier exporte une instance unique de React à utiliser dans toute l'application.
 * Cela garantit que tous les composants utilisent la même instance de React,
 * évitant ainsi les problèmes de versions multiples qui peuvent survenir avec
 * le code-splitting ou des dépendances circulaires.
 */

import * as React from 'react';

// Exporter l'instance unique de React
export { React };

// Exporter createContext pour centraliser son utilisation
export const createContext = React.createContext;

// Fonctions utilitaires pour faciliter l'utilisation
export const useState = React.useState;
export const useEffect = React.useEffect;
export const useContext = React.useContext;
export const useCallback = React.useCallback;
export const useMemo = React.useMemo;
export const useRef = React.useRef;
export const useLayoutEffect = React.useLayoutEffect;

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
