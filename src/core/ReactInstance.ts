/**
 * ReactInstance.ts
 * 
 * Module central qui expose une instance unique de React à utiliser dans toute l'application.
 * Cela garantit que tous les composants utilisent la même instance, évitant ainsi
 * les problèmes de versions multiples qui peuvent survenir avec le code-splitting
 * ou des dépendances circulaires.
 */

import * as React from 'react';

// Instance React complète
export { React };

// Hooks React principaux
export const useState = React.useState;
export const useEffect = React.useEffect;
export const useContext = React.useContext;
export const useCallback = React.useCallback;
export const useMemo = React.useMemo;
export const useRef = React.useRef;
export const useReducer = React.useReducer;
export const useLayoutEffect = React.useLayoutEffect;
export const useImperativeHandle = React.useImperativeHandle;
export const useDebugValue = React.useDebugValue;
export const useDeferredValue = React.useDeferredValue;
export const useTransition = React.useTransition;
export const useId = React.useId;

// Méthodes pour création d'éléments et contextes
export const createElement = React.createElement;
export const createContext = React.createContext;
export const createRef = React.createRef;
export const forwardRef = React.forwardRef;
export const lazy = React.lazy;
export const memo = React.memo;
export const Fragment = React.Fragment;
export const Suspense = React.Suspense;
export const StrictMode = React.StrictMode;

// Exports de types communs pour éviter des imports directs de 'react'
export type {
  ReactNode,
  ReactElement,
  ComponentType,
  ComponentProps,
  FC,
  FunctionComponent,
  PropsWithChildren,
  Ref,
  RefObject,
  CSSProperties,
  ChangeEvent,
  FormEvent,
  MouseEvent,
  KeyboardEvent
} from 'react';

// Vérifier si React est correctement chargé
export function checkReactInstance() {
  if (!React || !React.version) {
    console.error("ERREUR CRITIQUE: React n'est pas correctement chargé");
    return false;
  }
  
  console.log(`React version ${React.version} chargé correctement`);
  return true;
}

// Assigner React à window pour faciliter le débogage et la compatibilité
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
 * Fonction utilitaire pour détecter les problèmes d'instance React multiple
 * @returns {{ hasDifferentInstances: boolean, instanceDetails: object }}
 */
export function detectMultipleReactInstances() {
  if (typeof window === 'undefined') return { hasDifferentInstances: false, instanceDetails: {} };
  
  // Vérifier si une autre instance React existe globalement
  const globalReact = window.React;
  const thisReact = React;
  
  const hasDifferentInstances = globalReact !== thisReact;
  
  return {
    hasDifferentInstances,
    instanceDetails: {
      thisVersion: thisReact.version,
      globalVersion: globalReact?.version,
      isSameObject: globalReact === thisReact,
      versionMismatch: globalReact?.version !== thisReact.version
    }
  };
}
