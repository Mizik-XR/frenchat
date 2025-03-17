
/**
 * Utilitaire de diagnostic pour identifier les problèmes d'instances React
 * 
 * Ce module permet de vérifier si plusieurs instances de React sont utilisées
 * dans l'application, ce qui peut conduire à des erreurs avec createContext.
 */

import { React as CentralReact, checkReactInstance } from '@/core/ReactInstance';

/**
 * Vérifie si l'application utilise plusieurs instances de React
 * @returns Un objet contenant le résultat du diagnostic
 */
export function diagnoseReactInstances() {
  // Vérifier l'instance centrale
  const centralInstanceOK = checkReactInstance();
  
  // Tenter d'importer React directement (cela pourrait créer une instance différente)
  let directImportReact;
  try {
    directImportReact = require('react');
  } catch (e) {
    console.error("Erreur lors de l'importation directe de React:", e);
    directImportReact = null;
  }
  
  // Vérifier si l'instance globale (window.React) existe et diffère de notre instance centrale
  let globalReact = null;
  let usesMultipleInstances = false;
  let instanceComparison = 'Non vérifiable (erreur)';
  
  if (typeof window !== 'undefined' && 'React' in window) {
    globalReact = (window as any).React;
    
    // Comparer les instances
    if (directImportReact && CentralReact && globalReact) {
      const isDirect = directImportReact === CentralReact;
      const isGlobal = globalReact === CentralReact;
      
      usesMultipleInstances = !isDirect || !isGlobal;
      instanceComparison = `Instance directe: ${isDirect ? 'Identique' : 'Différente'}, ` +
                          `Instance globale: ${isGlobal ? 'Identique' : 'Différente'}`;
    }
  }
  
  // Tester createContext
  let createContextWorks = false;
  try {
    const TestContext = CentralReact.createContext(null);
    createContextWorks = !!TestContext;
  } catch (e) {
    console.error("Erreur lors du test de createContext:", e);
  }
  
  return {
    centralInstanceOK,
    usesMultipleInstances,
    createContextWorks,
    instanceComparison,
    hasCentralReact: !!CentralReact,
    hasDirectImport: !!directImportReact,
    hasGlobalReact: !!globalReact
  };
}

/**
 * Exécute le diagnostic React et affiche les résultats dans la console
 */
export function runReactDiagnostic() {
  console.group('📊 Diagnostic des instances React');
  
  const results = diagnoseReactInstances();
  
  console.log('Résultats du diagnostic:');
  console.table({
    'Instance centrale valide': results.centralInstanceOK,
    'createContext fonctionnel': results.createContextWorks,
    'Instances multiples détectées': results.usesMultipleInstances,
    'Comparaison des instances': results.instanceComparison
  });
  
  if (results.usesMultipleInstances) {
    console.warn('⚠️ ATTENTION: Plusieurs instances de React détectées. Cela peut causer des problèmes avec createContext et les hooks.');
    console.warn('Assurez-vous d\'importer React uniquement depuis @/core/ReactInstance');
  }
  
  if (!results.createContextWorks) {
    console.error('🔴 ERREUR CRITIQUE: createContext ne fonctionne pas correctement.');
    console.error('Cela conduira à des erreurs avec les contextes et les hooks.');
  }
  
  console.groupEnd();
  
  return results;
}

// Exécuter le diagnostic automatiquement au chargement en développement
if (import.meta.env.DEV) {
  setTimeout(() => {
    runReactDiagnostic();
  }, 1000);
}
