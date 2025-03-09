
// Point d'entrée pour les modules de monitoring
// Utilise l'exportation dynamique pour éviter les problèmes d'importation circulaire

import { ReactErrorMonitor } from './ReactErrorMonitor';
import { SentryMonitor } from './sentry-integration';
import { ErrorLogger } from './logger';
import * as ErrorTypes from './types';

// Fonction d'initialisation sécurisée
const initializeMonitoring = () => {
  try {
    // En production, initialiser Sentry avec un délai pour éviter les conflits
    if (process.env.NODE_ENV !== 'development') {
      // Séquence d'initialisation progressive
      setTimeout(() => SentryMonitor.initialize(), 1500);
    }
    
    // Journal local toujours initialisé
    console.log("Monitoring modules loaded successfully");
  } catch (error) {
    console.error("Error initializing monitoring:", error);
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
