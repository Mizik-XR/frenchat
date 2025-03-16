
/**
 * Module d'initialisation globale de React
 * Ce module garantit que React est correctement initialisé et disponible globalement
 * avant d'être utilisé par d'autres parties de l'application.
 */

import React from 'react';

// État d'initialisation avec garde-fou
let initialized = false;

/**
 * Initialise React globalement
 * Cette fonction doit être appelée avant toute utilisation de React
 */
export function initializeReact(): void {
  // Ne pas réinitialiser si déjà fait
  if (initialized) {
    return;
  }

  try {
    // Vérifier si window existe (environnement navigateur)
    if (typeof window !== 'undefined' && window) {
      // Vérifier si React est disponible
      if (!window.React && React) {
        console.log('[ReactInitializer] Initialisation globale de React...');
        
        // Définir React globalement - avec une assertion de type sécurisée
        (window as any).React = React;
        
        // Vérification après l'initialisation
        if ((window as any).React && (window as any).React.createContext) {
          console.log('[ReactInitializer] React initialisé avec succès');
        } else {
          console.warn('[ReactInitializer] React initialisé mais createContext non disponible');
        }
      } else if (window.React) {
        console.log('[ReactInitializer] React déjà disponible globalement');
      }
    }
  } catch (error) {
    console.error('[ReactInitializer] Erreur lors de l\'initialisation de React:', error);
  }

  // Marquer comme initialisé même en cas d'erreur pour éviter les tentatives répétées
  initialized = true;
}

/**
 * Vérifie si React est correctement initialisé
 */
export function isReactAvailable(): boolean {
  if (typeof window === 'undefined') {
    return !!React;
  }
  
  return !!(
    (window as any).React && 
    (window as any).React.createElement &&
    (window as any).React.createContext
  );
}

/**
 * Wrapper sécurisé pour React.createContext
 * Utilise directement l'import React plutôt que window.React
 */
export function safeCreateContext<T>(defaultValue: T) {
  // Toujours utiliser l'import direct pour éviter les problèmes
  return React.createContext<T>(defaultValue);
}

// Initialiser React dès l'importation du module
initializeReact();

export default {
  initializeReact,
  isReactAvailable,
  safeCreateContext
};
