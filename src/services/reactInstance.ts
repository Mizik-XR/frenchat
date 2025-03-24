/**
 * Instance React Centralisée
 * 
 * Ce module expose une instance unique de React pour éviter les problèmes
 * liés à l'utilisation de multiples copies de React dans l'application.
 * 
 * Toutes les importations de React devraient se faire via ce module.
 */

// Importer React et ses hooks
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
  useReducer,
  useLayoutEffect,
  useImperativeHandle,
  useDebugValue,
  useId,
  useDeferredValue,
  createContext,
  memo,
  forwardRef,
  lazy,
  Suspense,
} from 'react';

// Importer les types courants de React
import type {
  FC,
  ReactNode,
  ReactElement,
  ComponentType,
  PropsWithChildren,
  PropsWithRef,
  RefObject,
  Reducer,
  Dispatch,
  SetStateAction,
  FormEvent,
  ChangeEvent,
  MouseEvent,
  KeyboardEvent,
  FocusEvent,
  CSSProperties,
} from 'react';

// Exporter les modules et hooks React
export {
  // Instance principale
  React,
  
  // Hooks standard
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
  useReducer,
  useLayoutEffect,
  useImperativeHandle,
  useDebugValue,
  useId,
  useDeferredValue,
  
  // Fonctions utilitaires
  createContext,
  memo,
  forwardRef,
  lazy,
  Suspense,
};

// Exporter les types
export type {
  FC,
  ReactNode,
  ReactElement,
  ComponentType,
  PropsWithChildren,
  PropsWithRef,
  RefObject,
  Reducer,
  Dispatch,
  SetStateAction,
  FormEvent,
  ChangeEvent,
  MouseEvent,
  KeyboardEvent,
  FocusEvent,
  CSSProperties,
};

// Alias pour faciliter la transition
export default React; 