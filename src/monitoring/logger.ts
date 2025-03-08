
import { LogLevel } from './types';

/**
 * Service central de journalisation pour l'application
 * Gère l'enregistrement des erreurs et logs dans localStorage
 * et prépare les données pour d'éventuels services externes
 */
export class ErrorLogger {
  private static readonly STORAGE_KEY = 'filechat_error_log';
  private static maxLogEntries = 100; // Configurable via env

  /**
   * Initialise le logger avec les paramètres d'environnement
   */
  static initialize() {
    try {
      // Récupérer la configuration depuis les variables d'environnement
      if (import.meta.env.VITE_MAX_ERROR_LOG_SIZE) {
        this.maxLogEntries = parseInt(import.meta.env.VITE_MAX_ERROR_LOG_SIZE, 10);
      }
      
      console.log(`[Logger] Initialisé avec une capacité de ${this.maxLogEntries} entrées`);
    } catch (error) {
      console.warn('[Logger] Erreur d\'initialisation', error);
    }
  }

  /**
   * Enregistre un message dans le journal
   */
  static log(level: LogLevel, message: string, context?: any) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}`;
    
    // Log console standard
    if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
      console.error(logMessage);
    } else if (level === LogLevel.WARN) {
      console.warn(logMessage);
    } else {
      console.log(logMessage);
    }
    
    // Création de l'entrée de journal
    const logEntry = {
      timestamp,
      level,
      message,
      context: context ? this.sanitizeContext(context) : undefined
    };
    
    // Stocker dans localStorage
    this.storeLog(logEntry);
    
    return logMessage;
  }

  /**
   * Stocke une entrée de journal dans localStorage
   */
  private static storeLog(entry: any) {
    try {
      const logs = this.getLogs();
      logs.push(entry);
      
      // Conserver uniquement les entrées les plus récentes
      const trimmedLogs = logs.slice(-this.maxLogEntries);
      
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(trimmedLogs)
      );
    } catch (e) {
      console.warn('[Logger] Erreur de stockage dans localStorage', e);
    }
  }

  /**
   * Récupère les logs stockés
   */
  static getLogs() {
    try {
      const logsStr = localStorage.getItem(this.STORAGE_KEY);
      return logsStr ? JSON.parse(logsStr) : [];
    } catch (e) {
      console.warn('[Logger] Erreur lors de la récupération des logs', e);
      return [];
    }
  }

  /**
   * Efface tous les logs stockés
   */
  static clearLogs() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (e) {
      console.warn('[Logger] Erreur lors de la suppression des logs', e);
      return false;
    }
  }

  /**
   * Affiche les logs dans la console
   */
  static printLogs() {
    const logs = this.getLogs();
    console.group("FileChat - Journaux d'erreurs");
    logs.forEach((log: any) => {
      const { level, timestamp, message } = log;
      const formattedMessage = `[${timestamp}] [${level}] ${message}`;
      
      if (level === LogLevel.ERROR || level === LogLevel.CRITICAL) {
        console.error(formattedMessage);
      } else if (level === LogLevel.WARN) {
        console.warn(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
      
      if (log.context) {
        console.dir(log.context);
      }
    });
    console.groupEnd();
    return logs.length;
  }

  /**
   * Sanitize les données de contexte pour éviter des objets circulaires ou trop volumineux
   */
  private static sanitizeContext(context: any): any {
    try {
      if (!context) return undefined;
      
      // Si c'est une erreur, extraire les propriétés importantes
      if (context instanceof Error) {
        return {
          name: context.name,
          message: context.message,
          stack: context.stack
        };
      }
      
      // Si c'est un événement, extraire les propriétés utiles
      if (context instanceof Event) {
        const result: Record<string, any> = {
          type: context.type
        };
        
        if ('message' in context) {
          result.message = (context as any).message;
        }
        
        if ('filename' in context) {
          result.filename = (context as any).filename;
        }
        
        if ('lineno' in context) {
          result.lineno = (context as any).lineno;
        }
        
        return result;
      }
      
      // Pour les objets ordinaires, tenter une sérialisation standard
      return JSON.parse(JSON.stringify(context));
    } catch (e) {
      // En cas d'échec, renvoyer une version simplifiée
      return {
        type: typeof context,
        stringValue: String(context).substring(0, 1000),
        error: 'Contexte trop complexe pour être sérialisé'
      };
    }
  }
}

// Initialiser le logger
ErrorLogger.initialize();
