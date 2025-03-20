
/**
 * Instance centralisée de React pour éviter les problèmes d'instances multiples
 * 
 * Utiliser cette importation au lieu d'importer directement depuis 'react'
 * pour garantir qu'une seule instance de React est utilisée dans l'application.
 */
import * as React from 'react';
import * as ReactDOMImport from 'react-dom/client';

// Fonctions React standard
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
  useDebugValue,
  createContext,
  createElement,
  Fragment,
  forwardRef,
  memo,
  lazy,
  Suspense,
  isValidElement,
  Children
} = React;

// Instance de React
export { React };

// Exporter ReactDOM
export const ReactDOM = ReactDOMImport;

/**
 * Crée un contexte React de manière sécurisée pour éviter les problèmes liés aux différences
 * d'instances de React entre les composants.
 * 
 * @param defaultValue La valeur par défaut du contexte
 */
export function createContextSafely<T>(defaultValue: T) {
  return React.createContext(defaultValue);
}

/**
 * Utilitaire pour créer des hooks personnalisés de manière sécurisée
 * en utilisant l'instance React partagée.
 */
export const hooks = {
  useState: React.useState,
  useEffect: React.useEffect,
  useContext: React.useContext,
  useReducer: React.useReducer,
  useCallback: React.useCallback,
  useMemo: React.useMemo,
  useRef: React.useRef
};
