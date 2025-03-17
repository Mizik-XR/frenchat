
/**
 * Module de diagnostic pour l'intégration Lovable et React
 * 
 * Ce module fournit des outils pour diagnostiquer les problèmes
 * d'intégration entre Lovable, React et les différentes instances.
 */

import { React } from '@/core/ReactInstance';

/**
 * Exécute un diagnostic complet de l'intégration Lovable
 * @returns Object avec les résultats du diagnostic
 */
export function runLovableDiagnostic() {
  console.log('🔍 Diagnostic Complet Lovable et React');
  
  // Vérification de React
  const reactOk = typeof React !== 'undefined' && React.version;
  console.log(`✅ Instance React: ${reactOk ? 'Correcte' : 'Problématique'}`);
  
  // Vérification Lovable
  const lovableLoaded = typeof window !== 'undefined' && 
    ('GPTEngineer' in window || '__GPTEngineer' in window);
  console.log(`✅ Script Lovable: ${lovableLoaded ? 'Chargé' : 'Non chargé'}`);
  
  // Vérification des objets globaux
  const globalChecks = {
    reactVersion: React?.version,
    lovablePresent: typeof window !== 'undefined' && 'GPTEngineer' in window,
    windowReact: typeof window !== 'undefined' && window.React !== undefined,
    reactInstancesMatch: typeof window !== 'undefined' && window.React === React
  };
  
  console.log('🌐 Objets globaux:', globalChecks);
  
  // Vérification des imports circulaires connus
  const knownCircularImports = checkKnownCircularImports();
  console.log('🔄 Dépendances circulaires connues:', knownCircularImports);
  
  return {
    ...globalChecks,
    circularImports: knownCircularImports
  };
}

/**
 * Vérifie les dépendances circulaires connues
 */
function checkKnownCircularImports() {
  const circularPatterns = [
    { from: 'client.ts', to: 'sessionManager.ts', present: false },
    { from: 'appState.ts', to: 'supabaseCompat.ts', present: false },
    { from: 'supabaseCompat.ts', to: 'sessionManager.ts', present: false }
  ];
  
  // Dans un environnement de production, nous ne pouvons pas vérifier directement
  // les imports, mais nous pouvons enregistrer les modèles connus
  return circularPatterns;
}

/**
 * Vérifie l'intégration du script Lovable dans le DOM
 */
export function checkLovableScriptPresence() {
  if (typeof window === 'undefined') return false;
  
  const lovableScripts = document.querySelectorAll('script[src*="gptengineer.js"]');
  const isPresent = lovableScripts.length > 0;
  
  console.log(`Script Lovable dans le DOM: ${isPresent ? 'Présent' : 'Absent'}`);
  if (isPresent) {
    // Correction ici: Cast explicite du type Element à HTMLScriptElement
    const scriptElement = lovableScripts[0] as HTMLScriptElement;
    console.log('Attributs du script:', {
      type: scriptElement.getAttribute('type'),
      async: scriptElement.async,
      position: scriptElement.parentNode?.nodeName
    });
  }
  
  return isPresent;
}

/**
 * Auto-exécution du diagnostic au chargement du module
 */
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Exécution automatique du diagnostic Lovable');
    runLovableDiagnostic();
    checkLovableScriptPresence();
  });
  
  // Également vérifier après un court délai pour s'assurer que tout est chargé
  setTimeout(() => {
    console.log('⏱️ Vérification différée du diagnostic Lovable');
    runLovableDiagnostic();
    checkLovableScriptPresence();
  }, 2000);
}

// Pour le débogage dans la console du navigateur
if (typeof window !== 'undefined') {
  (window as any).__runLovableDiagnostic = runLovableDiagnostic;
  (window as any).__checkLovableScript = checkLovableScriptPresence;
}
