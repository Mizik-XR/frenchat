
/**
 * Niveaux de journalisation pour l'application
 */
export enum LogLevel {
  INFO = 'INFO',
  DEBUG = 'DEBUG',
  WARN = 'WARN',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

/**
 * Types d'erreurs détectables automatiquement
 */
export enum ErrorType {
  NETWORK = 'NETWORK',
  MODULE_LOADING = 'MODULE_LOADING',
  REACT_RENDERING = 'REACT_RENDERING',
  RESOURCE_LOADING = 'RESOURCE_LOADING',
  PROMISE_REJECTION = 'PROMISE_REJECTION',
  API_ERROR = 'API_ERROR',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Interface pour les informations de connexion
 */
export interface ConnectionInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Informations sur le navigateur
 */
export interface BrowserInfo {
  userAgent: string;
  platform: string;
  language: string;
  cookiesEnabled: boolean;
  viewport: {
    width: number;
    height: number;
  };
  connection: ConnectionInfo;
}

/**
 * Options pour l'intégration avec un service externe de monitoring
 */
export interface ExternalMonitoringOptions {
  enabled: boolean;
  dsn?: string;
  environment?: string;
  includeErrors?: boolean;
  includeWarnings?: boolean;
  includeLogs?: boolean;
}

/**
 * Type pour les gestionnaires d'erreurs et de rejets de promesses
 */
export type ErrorHandler = (event: ErrorEvent) => void;
export type RejectionHandler = (event: PromiseRejectionEvent) => void;

/**
 * Interface pour les métadonnées de journal d'erreur
 */
export interface ErrorLogMetadata {
  timestamp: string;
  context?: string;
  source?: string;
  browser?: Partial<BrowserInfo>;
  user?: {
    id?: string;
    isAuthenticated?: boolean;
  };
}

/**
 * Types pour l'intégration Sentry
 * Déclaration unique pour éviter les duplications
 */
export declare namespace SentryTypes {
  type SeverityLevel = "fatal" | "error" | "warning" | "info" | "debug";
}
