
/**
 * Utilitaire pour garantir que React est correctement initialisé avant son utilisation
 * Ce module aide à prévenir les erreurs "Cannot read properties of undefined (reading 'createContext')"
 */

import React from 'react';

/**
 * Vérifie si React est correctement initialisé
 */
export const isReactInitialized = (): boolean => {
  return (
    typeof React !== 'undefined' && 
    React !== null && 
    typeof React.createElement === 'function' &&
    typeof React.createContext === 'function'
  );
};

/**
 * Initialise explicitement React si nécessaire
 * Cette fonction aide à s'assurer que React est disponible avant que d'autres parties du code ne tentent de l'utiliser
 */
export const ensureReactInitialized = (): void => {
  // Si React n'est pas correctement initialisé, nous allons tenter de le définir globalement
  if (!isReactInitialized()) {
    console.warn('React n\'est pas correctement initialisé, tentative de récupération...');
    
    try {
      // Vérification si React est disponible dans window
      if (window && !window.React && React) {
        // @ts-ignore - Définir React globalement si nécessaire
        window.React = React;
        console.log('React a été défini globalement pour la compatibilité');
      }
    } catch (error) {
      console.error('Échec de l\'initialisation forcée de React:', error);
    }
  }
};

/**
 * Cette fonction crée un contexte React de manière sécurisée
 * Elle s'assure que React est initialisé avant de tenter d'utiliser createContext
 */
export function safeCreateContext<T>(defaultValue: T) {
  ensureReactInitialized();
  
  try {
    return React.createContext<T>(defaultValue);
  } catch (error) {
    console.error('Erreur lors de la création du contexte React:', error);
    throw new Error('Impossible de créer un contexte React. L\'application pourrait ne pas fonctionner correctement.');
  }
}

// Exécuter l'initialisation immédiatement
ensureReactInitialized();

export default {
  isReactInitialized,
  ensureReactInitialized,
  safeCreateContext
};
