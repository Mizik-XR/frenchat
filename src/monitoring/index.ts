
// Point d'entrée pour les modules de monitoring
// Utilise l'exportation dynamique pour éviter les problèmes d'importation circulaire

import { ReactErrorMonitor } from './ReactErrorMonitor';
import { SentryMonitor } from './sentry-integration';
import { ErrorLogger } from './logger';
import * as ErrorTypes from './types';

// Fonction d'initialisation sécurisée
const initializeMonitoring = () => {
  try {
    // En production, vérifier si Sentry est déjà chargé via le script
    if (process.env.NODE_ENV !== 'development') {
      console.log("Vérification de l'état de Sentry...");
      // Vérifier si Sentry est disponible via le script de chargement
      if (window.Sentry) {
        console.log("Sentry détecté via le script de chargement");
      } else {
        console.warn("Sentry n'est pas disponible, surveillance limitée");
      }
    }
    
    // Journal local toujours initialisé
    console.log("Modules de monitoring chargés avec succès");
  } catch (error) {
    console.error("Erreur lors de l'initialisation du monitoring:", error);
  }
};

// Déclencher l'initialisation
initializeMonitoring();

// Exporter tous les modules
export { 
  ReactErrorMonitor,
  SentryMonitor,
  ErrorLogger,
  ErrorTypes
};
