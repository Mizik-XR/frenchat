
/**
 * Outil d'auto-correction pour l'intégration Lovable
 * 
 * Ce module fournit des fonctions pour diagnostiquer et corriger
 * automatiquement les problèmes d'intégration avec Lovable.
 */

import { runLovableDiagnostic, checkLovableScriptPresence } from '../diagnostic/lovableDiagnostic';

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
    lovableNotInitialized: !diagnosticResults.lovablePresent
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
    console.log('Recommandation: Vérifier que tous les imports React utilisent @/core/ReactInstance');
  }
  
  // Vérification finale
  setTimeout(() => {
    console.log('Vérification post-correction:');
    runLovableDiagnostic();
    
    // Afficher instructions pour l'utilisateur
    console.log('🔍 AUTO-CORRECTION TERMINÉE');
    console.log('Si les problèmes persistent:');
    console.log('1. Rafraîchissez la page');
    console.log('2. Exécutez le script de correction manuel (scripts/fix-edit-issues.sh)');
    console.log('3. Vérifiez que le navigateur n\'a pas bloqué le script');
  }, 1000);
  
  return issues;
}

/**
 * Injecte le script Lovable dans le DOM
 */
function injectLovableScript() {
  const script = document.createElement('script');
  script.src = 'https://cdn.gpteng.co/gptengineer.js';
  script.type = 'module';
  script.setAttribute('data-auto-injected', 'true');
  
  // Insérer en haut du document pour s'assurer qu'il se charge tôt
  document.head.insertBefore(script, document.head.firstChild);
  
  console.log('Script Lovable injecté dynamiquement');
}

// Exposer la fonction pour une utilisation dans la console
if (typeof window !== 'undefined') {
  (window as any).__fixLovable = autoFixLovableIntegration;
  console.log('🛠️ Outil de correction Lovable disponible via window.__fixLovable()');
}

// Auto-exécution si spécifié via URL
if (typeof window !== 'undefined' && window.location.search.includes('autofix=lovable')) {
  console.log('Mode auto-correction activé via URL');
  setTimeout(autoFixLovableIntegration, 1000);
}
