
/**
 * Générateur de rapport de diagnostic complet
 * 
 * Ce module combine les différents outils d'analyse pour produire
 * un rapport complet sur l'état actuel de l'application.
 */

import { runLovableDiagnostic } from './lovableDiagnostic';
import { analyzeDependencies, generateDependencyReport, detectCircularDependencies } from './dependencyAnalyzer';
import { analyzeContexts, generateContextReport } from './contextAnalyzer';

/**
 * Génère un rapport complet de diagnostic
 */
export function generateCompleteReport(): string {
  console.log('Génération du rapport de diagnostic complet...');
  
  // Exécuter toutes les analyses
  const lovableDiagnostic = runLovableDiagnostic();
  // Utiliser un objet vide comme fallback pour éviter les erreurs
  const dependencyMap = analyzeDependencies({}) || new Map();
  const dependencyReport = generateDependencyReport(dependencyMap);
  const contextReport = generateContextReport();
  
  // Générer le rapport combiné
  let report = '# Rapport de diagnostic complet de Frenchat\n\n';
  report += `**Date:** ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n`;
  
  // Section Lovable
  report += '## 1. Diagnostic Lovable\n\n';
  report += '### Résultats\n\n';
  report += `- Version React: ${lovableDiagnostic.reactVersion}\n`;
  report += `- Script Lovable présent: ${lovableDiagnostic.lovablePresent ? 'Oui' : 'Non'}\n`;
  report += `- React dans window: ${lovableDiagnostic.windowReact ? 'Oui' : 'Non'}\n`;
  report += `- Instances React synchronisées: ${lovableDiagnostic.reactInstancesMatch ? 'Oui' : 'Non'}\n`;
  report += `- Dépendances circulaires détectées: ${lovableDiagnostic.circularImports.length}\n\n`;
  
  if (lovableDiagnostic.circularImports.length > 0) {
    report += '### Dépendances circulaires identifiées\n\n';
    lovableDiagnostic.circularImports.forEach((dep, index) => {
      report += `${index + 1}. ${dep.from} ↔ ${dep.to}\n`;
    });
    report += '\n';
  }
  
  // Ajouter le rapport de dépendances
  report += '## 2. Analyse des dépendances\n\n';
  report += dependencyReport;
  
  // Ajouter le rapport de contextes
  report += '## 3. Analyse des contextes React\n\n';
  report += contextReport;
  
  // Ajouter des recommandations globales
  report += '## 4. Plan de refactorisation recommandé\n\n';
  
  report += '### Phase 1: Nettoyage initial\n\n';
  report += '1. Standardiser tous les imports React pour utiliser ReactInstance\n';
  report += '2. Éliminer les dépendances circulaires identifiées\n';
  report += '3. Simplifier l\'architecture des contextes\n\n';
  
  report += '### Phase 2: Optimisation\n\n';
  report += '1. Diviser les contextes lourds\n';
  report += '2. Optimiser les rendus à l\'aide de React.memo et useMemo\n';
  report += '3. Mettre en place une stratégie de chargement différé\n\n';
  
  report += '### Phase 3: Tests et validation\n\n';
  report += '1. Créer des tests automatisés pour chaque module refactorisé\n';
  report += '2. Vérifier les métriques de performance\n';
  report += '3. Valider la couverture fonctionnelle\n\n';
  
  console.log('Génération du rapport terminée');
  return report;
}

// Exporter la fonction pour une utilisation dans la console
if (typeof window !== 'undefined') {
  (window as any).__generateCompleteReport = generateCompleteReport;
  console.log('Outil de génération de rapport complet disponible via window.__generateCompleteReport()');
}
