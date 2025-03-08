
import { LogLevel } from './types';
import { SentryMonitor } from './sentry-integration';

/**
 * Service de journalisation centralisé
 * Gère la journalisation des erreurs, avertissements et autres informations de débogage
 */
export class ErrorLogger {
  private static logs: string[] = [];
  private static readonly MAX_LOGS = Number(import.meta.env.VITE_MAX_ERROR_LOG_SIZE) || 100;
  
  /**
   * Journalise un message avec un niveau de gravité spécifique
   */
  static log(level: LogLevel, message: string, context?: any): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Ajouter au journal interne
    this.logs.push(formattedMessage);
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift(); // Supprimer l'entrée la plus ancienne
    }
    
    // Journaliser dans la console avec la couleur appropriée
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, context || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, context || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, context || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.CRITICAL:
        console.error(formattedMessage, context || '');
        break;
    }
    
    // Envoyer à Sentry si c'est un niveau d'erreur ou critique
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      if (context instanceof Error) {
        SentryMonitor.captureException(context, { message });
      } else {
        SentryMonitor.captureMessage(
          message, 
          SentryMonitor.translateLogLevel(level), 
          context
        );
      }
    }
  }
  
  /**
   * Récupère tous les journaux
   */
  static getLogs(): string[] {
    return [...this.logs];
  }
  
  /**
   * Efface tous les journaux
   */
  static clearLogs(): boolean {
    this.logs = [];
    return true;
  }
  
  /**
   * Affiche tous les journaux dans la console
   */
  static printLogs(): number {
    console.group('Error Logs:');
    this.logs.forEach(log => console.log(log));
    console.groupEnd();
    return this.logs.length;
  }
}
