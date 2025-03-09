
// Point d'entrée pour les modules de monitoring
// Utilise l'exportation dynamique pour éviter les problèmes d'importation circulaire

import { ReactErrorMonitor } from './ReactErrorMonitor';
import { SentryMonitor } from './sentry-integration';
import { ErrorLogger } from './logger';
import * as ErrorTypes from './types';

// Exporter tous les modules
export { 
  ReactErrorMonitor,
  SentryMonitor,
  ErrorLogger,
  ErrorTypes
};
