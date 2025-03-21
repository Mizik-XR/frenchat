
/**
 * Ce fichier garantit que nous n'utilisons qu'une seule instance de React dans toute l'application
 * 
 * Utiliser cette importation au lieu d'importer directement depuis 'react'
 * aide à éviter les problèmes avec des instances multiples de React.
 */

// Importer React avec un try-catch pour gérer les erreurs d'importation
let React;
try {
  React = require('react');
  
  // Si React est chargé mais incomplet, le détecter rapidement
  if (!React || typeof React.createElement !== 'function' || !React.createContext) {
    console.error('ERREUR CRITIQUE: Instance React incomplète chargée');
    // Tentative de récupération en utilisant window.React si disponible
    if (typeof window !== 'undefined' && window.React) {
      console.warn('Tentative de récupération avec window.React');
      React = window.React;
    }
  }
} catch (error) {
  console.error('ERREUR CRITIQUE: Impossible de charger React', error);
  // Récupération de secours pour les environnements de prévisualisation
  if (typeof window !== 'undefined' && window.React) {
    console.warn('Utilisation de window.React comme solution de secours');
    React = window.React;
  } else {
    // Structure minimale pour éviter les erreurs fatales
    React = {
      version: 'fallback',
      createElement: () => ({}),
      createContext: (defaultValue) => ({
        Provider: ({ children }) => children,
        Consumer: ({ children }) => children,
        _currentValue: defaultValue
      }),
      useContext: () => ({}),
      useState: () => [null, () => {}],
      useEffect: () => {},
      useMemo: (fn) => fn(),
      useCallback: (fn) => fn
    };
    console.error('Mode de secours React activé - fonctionnalités limitées');
  }
}

// Importer explicitement les hooks pour les réexporter
const { 
  createContext, 
  useState, 
  useEffect, 
  useMemo, 
  useCallback, 
  useContext 
} = React;

// Exporter React directement
export { React };

// Exporter les hooks et autres utilitaires React
export {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext
};

/**
 * Version de React pour le débogage
 */
export const REACT_VERSION = React.version;

/**
 * Vérifie si l'instance React est correctement initialisée
 */
export function isReactInitialized(): boolean {
  return React != null && typeof React.createElement === 'function' && typeof React.createContext === 'function';
}

/**
 * Vérifie si nous sommes en mode de secours React
 */
export function isReactFallbackMode(): boolean {
  return React.version === 'fallback';
}

// Fonctions utilitaires pour vérifier l'état de React
export const ReactUtils = {
  version: React.version,
  isInitialized: isReactInitialized,
  isInFallbackMode: isReactFallbackMode,
  createElement: React.createElement,
  getGlobalReactStatus: () => {
    if (typeof window === 'undefined') return 'SERVER_SIDE';
    return window.React ? 'GLOBAL_AVAILABLE' : 'NO_GLOBAL';
  }
};

// Si React est disponible, le rendre disponible globalement
if (typeof window !== 'undefined' && isReactInitialized() && !window.React) {
  console.info('Initialisation de window.React pour compatibilité');
  window.React = React;
}

// Par défaut, exporter React
export default React;
