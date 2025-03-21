
/**
 * Configuration fondamentale de React
 * Ce fichier doit être importé avant toute utilisation de React
 * pour éviter les problèmes de dépendances circulaires
 */

// Configuration globale pour prévenir les problèmes d'instance React
// Ce fichier doit être importé en premier dans main.tsx
if (typeof window !== 'undefined') {
  // S'assurer que nous avons un point de démarrage propre
  // @ts-ignore - Ignorer l'erreur TypeScript pour cette propriété globale
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = window.__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
}

// Définir un objet global pour traquer l'application
// Cela aidera à éviter les problèmes de dépendances circulaires
if (typeof window !== 'undefined') {
  // @ts-ignore - Ignorer l'erreur TypeScript pour cette propriété globale
  window.__FILECHAT_APP__ = window.__FILECHAT_APP__ || {
    initialized: false,
    reactInstance: null,
    diagnostics: {
      setupRun: new Date().toISOString(),
      errors: []
    }
  };
  
  // Marquer que la configuration a été chargée
  // @ts-ignore - Ignorer l'erreur TypeScript pour cette propriété globale
  window.__FILECHAT_APP__.initialized = true;
}

// Si jamais nous avons besoin d'exporter quelque chose de ce fichier,
// assurez-vous qu'il ne crée pas de dépendances circulaires
export const setupCompleted = true;
