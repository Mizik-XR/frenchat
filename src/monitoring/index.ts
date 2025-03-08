
// Exporter tous les composants de monitoring pour faciliter l'importation
export * from './logger';
export * from './error-detector';
export * from './notification-manager';
export * from './ReactErrorMonitor';
export * from './types';
export * from './sentry-integration';

// Pour faciliter l'importation dans d'autres modules
import { ErrorLogger } from './logger';
import { LogLevel, ErrorType } from './types';
import { ErrorDetector } from './error-detector';
import { NotificationManager } from './notification-manager';
import { SentryMonitor } from './sentry-integration';

// Créer un objet pour l'API de monitoring
export const Monitoring = {
  // Méthodes de journalisation
  log: ErrorLogger.log,
  error: (message: string, context?: any) => ErrorLogger.log(LogLevel.ERROR, message, context),
  warn: (message: string, context?: any) => ErrorLogger.log(LogLevel.WARN, message, context),
  info: (message: string, context?: any) => ErrorLogger.log(LogLevel.INFO, message, context),
  debug: (message: string, context?: any) => ErrorLogger.log(LogLevel.DEBUG, message, context),
  critical: (message: string, context?: any) => ErrorLogger.log(LogLevel.CRITICAL, message, context),
  
  // Gestion des journaux
  getLogs: ErrorLogger.getLogs,
  clearLogs: ErrorLogger.clearLogs,
  printLogs: ErrorLogger.printLogs,
  
  // Notifications
  showError: (message: string) => NotificationManager.showErrorNotification(
    { message },
    ErrorType.UNKNOWN
  ),
  showWarning: NotificationManager.showWarningNotification,
  showSuccess: NotificationManager.showSuccessNotification,
  
  // Intégration Sentry
  captureException: SentryMonitor.captureException,
  captureMessage: SentryMonitor.captureMessage,
  
  // Initialisation explicite de Sentry (normalement fait automatiquement par ReactErrorMonitor)
  initializeSentry: SentryMonitor.initialize
};
