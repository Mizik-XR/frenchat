
// Exporter tous les composants de monitoring pour faciliter l'importation
export * from './logger';
export * from './error-detector';
export * from './notification-manager';
export * from './ReactErrorMonitor';
export * from './types';

// Pour faciliter l'importation dans d'autres modules
import { ErrorLogger } from './logger';
import { LogLevel, ErrorType } from './types';
import { ErrorDetector } from './error-detector';
import { NotificationManager } from './notification-manager';

// Créer un objet pour l'API de monitoring
export const Monitoring = {
  log: ErrorLogger.log,
  error: (message: string, context?: any) => ErrorLogger.log(LogLevel.ERROR, message, context),
  warn: (message: string, context?: any) => ErrorLogger.log(LogLevel.WARN, message, context),
  info: (message: string, context?: any) => ErrorLogger.log(LogLevel.INFO, message, context),
  debug: (message: string, context?: any) => ErrorLogger.log(LogLevel.DEBUG, message, context),
  critical: (message: string, context?: any) => ErrorLogger.log(LogLevel.CRITICAL, message, context),
  
  getLogs: ErrorLogger.getLogs,
  clearLogs: ErrorLogger.clearLogs,
  printLogs: ErrorLogger.printLogs,
  
  showError: (message: string) => NotificationManager.showErrorNotification(
    { message },
    ErrorType.UNKNOWN
  ),
  showWarning: NotificationManager.showWarningNotification,
  showSuccess: NotificationManager.showSuccessNotification
};
