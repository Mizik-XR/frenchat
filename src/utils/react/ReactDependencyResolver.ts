
/**
 * ReactDependencyResolver - Version simplifiée
 * 
 * Ce fichier fournit des utilitaires pour résoudre les problèmes de dépendances
 * circulaires dans les composants React, en utilisant l'instance unique de React.
 */

import { React } from '@/core/ReactInstance';

/**
 * Vérifie si l'instance de React est correctement chargée
 */
export function validateReactInstance(): boolean {
  if (!React || !React.version) {
    console.error("ERREUR CRITIQUE: Instance React non valide");
    return false;
  }
  
  return true;
}

/**
 * Détecte les problèmes de dépendances circulaires dans l'application
 */
export function detectCircularDependencies(): string[] {
  const circularDeps: string[] = [];
  
  // Cette fonction sera appelée en développement pour aider à détecter
  // les dépendances circulaires connues
  const knownCircularPatterns = [
    { from: 'client.ts', to: 'sessionManager.ts' },
    { from: 'profileUtils.ts', to: 'client.ts' },
    { from: 'index.ts', to: 'components/*.tsx' }
  ];
  
  // Logique de détection (simplifiée pour l'exemple)
  if (typeof window !== 'undefined') {
    try {
      // Vérifier si nous avons des erreurs communes de dépendances circulaires
      // dans la console (peut être étendu dans une implémentation réelle)
      const errorLogs = (console as any)._errorLogs || [];
      
      for (const log of errorLogs) {
        if (log.includes('circular') || log.includes('dependency')) {
          circularDeps.push(log);
        }
      }
      
      // Pour le développement, on peut logger les modèles connus
      if (process.env.NODE_ENV === 'development') {
        console.info("Modèles de dépendances circulaires connus:", knownCircularPatterns);
      }
    } catch (err) {
      console.warn("Erreur lors de la détection des dépendances circulaires:", err);
    }
  }
  
  return circularDeps;
}

/**
 * Fournit une solution de contournement pour les problèmes d'instances React multiples
 */
export function ensureSingleReactInstance() {
  if (typeof window !== 'undefined') {
    // S'assurer que nous avons une instance globale de React
    if (!window.React && React) {
      window.React = React;
      console.info("Instance React globale initialisée");
    } else if (window.React && window.React !== React) {
      console.warn("ATTENTION: Instances React multiples détectées");
      // On peut comparer les versions pour déboguer
      if (window.React.version !== React.version) {
        console.warn(`Versions React différentes: globale=${window.React.version}, importée=${React.version}`);
      }
    }
  }
}

// Exécuter la validation au chargement du module
validateReactInstance();
