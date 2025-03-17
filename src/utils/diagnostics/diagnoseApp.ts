
/**
 * Outil de diagnostic de l'application
 * 
 * Ce module fournit des fonctions pour analyser et diagnostiquer
 * les problèmes courants de l'application, notamment les problèmes
 * d'instances React et de dépendances circulaires.
 */

import { runReactDiagnostic } from './reactInstanceCheck';

/**
 * Exécute un diagnostic complet de l'application et affiche les résultats
 */
export function diagnoseApplication() {
  console.group('🔍 DIAGNOSTIC DE L\'APPLICATION');
  console.log('Démarrage du diagnostic complet de l\'application...');
  
  // Vérifier les instances React
  console.log('\n📊 Vérification des instances React:');
  const reactResults = runReactDiagnostic();
  
  // Vérifier l'état global
  console.log('\n🌐 Vérification de l\'état global:');
  try {
    const APP_STATE = window.__APP_STATE || {};
    console.log('État global disponible:', !!APP_STATE);
    console.log('Mode hors ligne:', APP_STATE.isOfflineMode || false);
  } catch (e) {
    console.error('Erreur lors de la vérification de l\'état global:', e);
  }
  
  // Vérifier le chargement des modules
  console.log('\n📦 Vérification des modules:');
  const modules = {
    'React': !!window.React,
    'ReactDOM': !!window.ReactDOM,
    'createContext': typeof window.React?.createContext === 'function',
    'useState': typeof window.React?.useState === 'function',
  };
  console.table(modules);
  
  // Afficher un résumé
  console.log('\n📝 RÉSUMÉ DU DIAGNOSTIC:');
  
  if (reactResults.usesMultipleInstances || !reactResults.createContextWorks) {
    console.error('❌ L\'application utilise plusieurs instances de React ou a des problèmes avec createContext');
    console.error('   → Risque élevé de problèmes avec les contextes et les hooks');
    console.error('   → Solution: Assurez-vous d\'importer React uniquement depuis @/core/ReactInstance');
  } else {
    console.log('✅ Les instances React semblent correctement configurées');
  }
  
  if (!modules.React || !modules.createContext) {
    console.error('❌ React ou createContext n\'est pas disponible globalement');
    console.error('   → Problème potentiel avec le chargement de React');
  } else {
    console.log('✅ React est correctement chargé globalement');
  }
  
  console.groupEnd();
}

// Exposer la fonction de diagnostic globalement en développement
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).__diagnoseApp = diagnoseApplication;
  console.log(
    '%c🔍 Utilisez window.__diagnoseApp() dans la console pour exécuter un diagnostic complet de l\'application',
    'color: blue; font-size: 12px; font-weight: bold;'
  );
}
