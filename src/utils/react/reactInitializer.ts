
/**
 * Utilitaire pour garantir que React est correctement initialisé avant son utilisation
 * Ce module utilise l'initialisation globale de React du module reactGlobalInitializer
 */

// Import only the functions we need, and rename safeCreateContext to avoid conflicts
import { initializeReact, isReactAvailable } from './reactGlobalInitializer';
import React from 'react';

// Initialisation immédiate pour garantir la disponibilité
initializeReact();

/**
 * Vérifie si React est correctement initialisé
 */
export const isReactInitialized = (): boolean => {
  return isReactAvailable();
};

/**
 * Initialise explicitement React si nécessaire
 */
export const ensureReactInitialized = (): void => {
  initializeReact();
};

/**
 * Cette fonction crée un contexte React de manière sécurisée
 * Elle utilise l'import direct de React plutôt que window.React
 */
export function safeCreateContext<T>(defaultValue: T) {
  try {
    // Utiliser React directement (import)
    return React.createContext<T>(defaultValue);
  } catch (error) {
    console.error('Erreur lors de la création du contexte React:', error);
    throw new Error('Impossible de créer un contexte React. L\'application pourrait ne pas fonctionner correctement.');
  }
}

// Exporter les mêmes méthodes que l'ancien module
export default {
  isReactInitialized,
  ensureReactInitialized,
  safeCreateContext
};
