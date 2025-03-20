
/**
 * Déclarations de types globaux pour l'application
 */

declare global {
  interface Window {
    runLovableDiagnostic?: () => string | void;
    __FILECHAT_DEBUG__?: any;
    GPTEngineer?: any;
    __GPTEngineer?: any;
  }
}

export {};
