
/**
 * Outil d'auto-correction pour l'intégration Lovable
 * 
 * Ce module fournit des fonctions pour diagnostiquer et corriger
 * automatiquement les problèmes d'intégration avec Lovable.
 */

import { runLovableDiagnostic, checkLovableScriptPresence } from '../diagnostic/lovableDiagnostic';
import { React } from '@/core/ReactInstance';

/**
 * Vérifie et corrige les problèmes courants d'intégration Lovable
 */
export function autoFixLovableIntegration() {
  console.log('🛠️ Démarrage de l\'auto-correction Lovable');
  
  // Exécuter le diagnostic
  const diagnosticResults = runLovableDiagnostic();
  
  // Vérifier si le script est présent
  const scriptPresent = checkLovableScriptPresence();
  
  // Problèmes détectés
  const issues = {
    scriptMissing: !scriptPresent,
    reactInstanceMismatch: !diagnosticResults.reactInstancesMatch,
    lovableNotInitialized: !diagnosticResults.lovablePresent,
    documentReady: document.readyState === 'complete'
  };
  
  console.log('Problèmes détectés:', issues);
  
  // Correction: Script manquant
  if (issues.scriptMissing) {
    console.log('Correction: Injection du script Lovable manquant');
    injectLovableScript();
  }
  
  // Correction: Instance React non synchronisée
  if (issues.reactInstanceMismatch) {
    console.log('Détection: Instances React multiples (problème potentiel)');
    console.log('Correction: Synchronisation des instances React');
    synchronizeReactInstances();
  }
  
  // Correction: Lovable non initialisé
  if (issues.lovableNotInitialized && scriptPresent) {
    console.log('Détection: Script présent mais Lovable non initialisé');
    console.log('Correction: Réinitialisation du script Lovable');
    reinjectLovableScript();
  }
  
  // Vérification finale
  setTimeout(() => {
    console.log('Vérification post-correction:');
    const postDiagnostic = runLovableDiagnostic();
    const postScriptPresent = checkLovableScriptPresence();
    
    const fixed = {
      scriptPresent: postScriptPresent,
      reactInstancesMatch: postDiagnostic.reactInstancesMatch,
      lovablePresent: postDiagnostic.lovablePresent
    };
    
    console.log('État après correction:', fixed);
    
    // Afficher instructions pour l'utilisateur
    console.log('🔍 AUTO-CORRECTION TERMINÉE');
    
    if (!fixed.scriptPresent || !fixed.lovablePresent) {
      console.log('⚠️ Certains problèmes persistent. Actions recommandées:');
      console.log('1. Exécutez le script fix-lovable-integration.sh (Linux/Mac) ou fix-lovable-integration.bat (Windows)');
      console.log('2. Rafraîchissez la page après avoir effacé le cache du navigateur');
      console.log('3. Essayez un navigateur Chromium (Chrome ou Edge)');
    } else {
      console.log('✅ Correction réussie! Si vous rencontrez encore des problèmes:');
      console.log('1. Rafraîchissez la page');
      console.log('2. Vérifiez que le navigateur n\'a pas bloqué le script');
    }
  }, 1500);
  
  return issues;
}

/**
 * Injecte le script Lovable dans le DOM
 */
function injectLovableScript() {
  try {
    const script = document.createElement('script');
    script.src = 'https://cdn.gpteng.co/gptengineer.js';
    script.type = 'module';
    script.dataset.autoInjected = 'true';
    script.dataset.timestamp = Date.now().toString();
    
    // Insérer en haut du document pour s'assurer qu'il se charge tôt
    document.head.insertBefore(script, document.head.firstChild);
    
    console.log('Script Lovable injecté dynamiquement');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'injection du script Lovable:', error);
    return false;
  }
}

/**
 * Réinjecte le script Lovable après avoir supprimé les instances précédentes
 */
function reinjectLovableScript() {
  try {
    // Supprimer les scripts existants
    const existingScripts = document.querySelectorAll('script[src*="gptengineer.js"]');
    existingScripts.forEach(script => script.remove());
    
    // Nettoyer les variables globales potentielles
    if (typeof window !== 'undefined') {
      if ('GPTEngineer' in window) {
        delete (window as any).GPTEngineer;
      }
      if ('__GPTEngineer' in window) {
        delete (window as any).__GPTEngineer;
      }
    }
    
    // Réinjecter le script
    return injectLovableScript();
  } catch (error) {
    console.error('Erreur lors de la réinjection du script Lovable:', error);
    return false;
  }
}

/**
 * Synchronise les instances React pour éviter les problèmes de multiple instances
 */
function synchronizeReactInstances() {
  if (typeof window !== 'undefined' && React) {
    // Assigner l'instance React du ReactInstance à window.React
    (window as any).React = React;
    console.log('Instances React synchronisées');
    return true;
  }
  return false;
}

/**
 * Vérifie si le script a pu être correctement chargé
 */
function verifyScriptLoading(): Promise<boolean> {
  return new Promise((resolve) => {
    // Attendre jusqu'à 3 secondes pour que le script se charge
    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(() => {
      attempts++;
      
      const lovableLoaded = typeof window !== 'undefined' && 
        ('GPTEngineer' in window || '__GPTEngineer' in window);
      
      if (lovableLoaded) {
        clearInterval(interval);
        resolve(true);
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        resolve(false);
      }
    }, 100);
  });
}

// Exposer la fonction pour une utilisation dans la console
if (typeof window !== 'undefined') {
  (window as any).__fixLovable = autoFixLovableIntegration;
  (window as any).__verifyLovable = verifyScriptLoading;
  console.log('🛠️ Outil de correction Lovable disponible via window.__fixLovable()');
}

// Auto-exécution si spécifié via URL
if (typeof window !== 'undefined') {
  if (window.location.search.includes('autofix=lovable')) {
    console.log('Mode auto-correction activé via URL');
    setTimeout(autoFixLovableIntegration, 1000);
  }
  
  // Détection des erreurs d'édition AI
  window.addEventListener('error', (event) => {
    if (event.message && 
        (event.message.includes('AI edits') || 
         event.message.includes('gptengineer'))) {
      console.warn('Erreur liée à Lovable détectée, tentative de correction...');
      autoFixLovableIntegration();
    }
  });
  
  // Vérification après le chargement complet
  window.addEventListener('load', () => {
    // Attendre que tout soit chargé
    setTimeout(() => {
      const scriptPresent = checkLovableScriptPresence();
      if (!scriptPresent) {
        console.warn('Script Lovable non détecté après chargement, injection automatique...');
        autoFixLovableIntegration();
      }
    }, 2000);
  });
}
