
/**
 * INSTANCE CENTRALE DE REACT
 * 
 * Ce fichier est le point d'entrée unique pour toutes les fonctionnalités React.
 * Il garantit que la même instance de React est utilisée dans toute l'application.
 * 
 * IMPORTANT: Importez toujours React depuis ce module, jamais directement depuis 'react'
 */

// Import direct de React pour garantir une instance unique
import * as ReactOriginal from 'react';
import * as ReactDOMOriginal from 'react-dom';
import * as ReactDOMClientOriginal from 'react-dom/client';

// Exporter React pour garantir qu'une seule instance est utilisée partout
export const React = ReactOriginal;
export const ReactDOM = ReactDOMOriginal;
export const ReactDOMClient = ReactDOMClientOriginal;

// Exportations nommées pour les API les plus couramment utilisées
export const {
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  createContext,
  memo,
  forwardRef,
  Fragment,
  Suspense,
  lazy,
  createElement,
  cloneElement,
  createRef,
  isValidElement
} = React;

/**
 * Vérifie si l'instance React est correctement configurée
 * @returns true si l'instance est correcte
 */
export function checkReactInstance(): boolean {
  // Vérifier si les composants vitaux sont disponibles
  if (!React || !React.createContext || !React.useState) {
    console.error("[ERREUR CRITIQUE] Instance React invalide détectée");
    return false;
  }
  
  return true;
}

/**
 * Récupération d'urgence de l'instance React
 * @returns l'instance React récupérée ou null
 */
export function getEmergencyReactInstance() {
  try {
    // Tentative d'accès à l'instance globale (en dernier recours)
    if (typeof window !== 'undefined' && 'React' in window) {
      console.warn("[RÉCUPÉRATION] Utilisation de l'instance React globale (window.React)");
      return (window as any).React;
    }
    
    // Si React n'est pas disponible globalement, essayer de le réimporter
    if (!React || !React.createContext) {
      console.warn("[RÉCUPÉRATION] Tentative de réimportation de React");
      const dynamicReact = require('react');
      return dynamicReact;
    }
    
    return null;
  } catch (e) {
    console.error("[ERREUR CRITIQUE] Échec de récupération de l'instance React:", e);
    return null;
  }
}
