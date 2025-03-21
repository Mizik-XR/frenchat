
/**
 * Générateur de rapports pour l'analyse de dépendances
 */

const chalk = require('chalk');
const path = require('path');

/**
 * Génère un rapport complet des résultats d'analyse
 * @param {Object} results - Résultats de l'analyse
 * @param {Array} circularDeps - Dépendances circulaires détectées
 * @param {Array} suggestions - Suggestions pour résoudre les problèmes
 */
function generateReport(results, circularDeps, suggestions) {
  console.log('\n============================================');
  console.log(chalk.blue('🔍 RAPPORT D\'ANALYSE DES DÉPENDANCES'));
  console.log('============================================\n');
  
  console.log(`Fichiers analysés: ${chalk.yellow(results.files.size)}`);
  console.log(`Dépendances circulaires détectées: ${chalk.yellow(circularDeps.length)}`);
  console.log(`Problèmes identifiés: ${chalk.yellow(results.totalIssues)}`);
  console.log('\n');
  
  // Afficher les dépendances circulaires
  if (circularDeps.length > 0) {
    console.log(chalk.yellow('🔄 DÉPENDANCES CIRCULAIRES:'));
    console.log('------------------------------------------');
    circularDeps.forEach((circular, index) => {
      console.log(`${chalk.gray(index + 1)}. ${chalk.red(circular.path)}`);
    });
    console.log('\n');
  }
  
  // Regrouper les problèmes par type et sévérité
  const problemsByType = new Map();
  const highSeverityProblems = [];
  const mediumSeverityProblems = [];
  const lowSeverityProblems = [];
  
  results.problems.forEach(problem => {
    // Regrouper par type
    if (!problemsByType.has(problem.type)) {
      problemsByType.set(problem.type, []);
    }
    problemsByType.get(problem.type).push(problem);
    
    // Regrouper par sévérité
    if (problem.type === 'direct-context-import' || problem.type === 'unsafe-context-creation') {
      highSeverityProblems.push(problem);
    } else if (problem.type === 'direct-react-import' || problem.type === 'react-createcontext') {
      mediumSeverityProblems.push(problem);
    } else {
      lowSeverityProblems.push(problem);
    }
  });
  
  // Afficher les problèmes par sévérité
  if (highSeverityProblems.length > 0) {
    console.log(chalk.red('🔴 PROBLÈMES CRITIQUES:'));
    console.log('------------------------------------------');
    highSeverityProblems.forEach((problem, index) => {
      console.log(`${chalk.gray(index + 1)}. ${problem.file}: ${problem.message}`);
      if (problem.suggestion) {
        console.log(`   ${chalk.green('Suggestion:')} ${problem.suggestion}`);
      }
    });
    console.log('\n');
  }
  
  if (mediumSeverityProblems.length > 0) {
    console.log(chalk.yellow('🟠 PROBLÈMES MOYENS:'));
    console.log('------------------------------------------');
    mediumSeverityProblems.forEach((problem, index) => {
      console.log(`${chalk.gray(index + 1)}. ${problem.file}: ${problem.message}`);
      if (problem.suggestion) {
        console.log(`   ${chalk.green('Suggestion:')} ${problem.suggestion}`);
      }
    });
    console.log('\n');
  }
  
  if (lowSeverityProblems.length > 0) {
    console.log(chalk.blue('🟡 PROBLÈMES MINEURS:'));
    console.log('------------------------------------------');
    lowSeverityProblems.forEach((problem, index) => {
      console.log(`${chalk.gray(index + 1)}. ${problem.file}: ${problem.message}`);
      if (problem.suggestion) {
        console.log(`   ${chalk.green('Suggestion:')} ${problem.suggestion}`);
      }
    });
    console.log('\n');
  }
  
  // Afficher les suggestions pour les dépendances circulaires
  if (suggestions.length > 0) {
    console.log(chalk.green('💡 SUGGESTIONS POUR RÉSOUDRE LES DÉPENDANCES CIRCULAIRES:'));
    console.log('------------------------------------------');
    suggestions.forEach((item, index) => {
      console.log(`${chalk.gray(index + 1)}. ${chalk.yellow(item.circularDep.path)}`);
      console.log(`   ${chalk.green('Solution:')}`);
      console.log(`   ${item.suggestion.split('\n').join('\n   ')}`);
      console.log();
    });
  }
  
  // Fichiers avec le plus de dépendances
  const dependencyCounts = new Map();
  for (const [file, deps] of results.dependencies) {
    dependencyCounts.set(file, deps.length);
  }
  
  console.log(chalk.blue('📊 TOP 10 FICHIERS AVEC LE PLUS DE DÉPENDANCES:'));
  console.log('------------------------------------------');
  
  const sortedFiles = [...dependencyCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  sortedFiles.forEach((entry, index) => {
    const relPath = path.relative(process.cwd(), entry[0]);
    console.log(`${chalk.gray(index + 1)}. ${chalk.cyan(relPath)} (${chalk.yellow(entry[1])} dépendances)`);
  });
  
  console.log('\n');
  console.log('============================================');
  console.log(`Rapport généré le ${new Date().toLocaleString()}`);
  console.log('============================================');
}

/**
 * Génère un rapport pour les suggestions d'amélioration du projet
 */
function generateImprovementSuggestions() {
  console.log('\n📝 SUGGESTIONS POUR AMÉLIORER LA STRUCTURE DU PROJET:');
  console.log('------------------------------------------\n');
  
  const suggestions = [
    {
      title: "CENTRALISER LES EXPORTS",
      description: "Créez des fichiers index.ts pour centraliser les exports par dossier",
      example: `// src/components/ui/index.ts\nexport * from "./button";\nexport * from "./card";\n// Puis importez: import { Button, Card } from "@/components/ui"`
    },
    {
      title: "UTILISER LE LAZY LOADING",
      description: "Chargez dynamiquement les composants lourds ou rarement utilisés",
      example: `// Au lieu d'un import statique\nconst HeavyComponent = React.lazy(() => import("./HeavyComponent"));\n// Puis utilisez avec <Suspense>`
    },
    {
      title: "ASSURER UNE INSTANCE REACT UNIQUE",
      description: "Utilisez une instance centrale de React pour éviter les problèmes de versions multiples",
      example: `// src/core/ReactInstance.ts\nimport * as React from "react";\nexport { React };\n// Puis importez: import { React } from "@/core/ReactInstance"`
    },
    {
      title: "SÉPARER SERVICES ET HOOKS",
      description: "Isolez la logique métier (services) des intégrations React (hooks)",
      example: `// src/services/dataService.ts - logique pure\nexport const fetchData = async () => { ... }\n\n// src/hooks/useData.ts - intégration React\nimport { fetchData } from "@/services/dataService";\nexport const useData = () => { ... }`
    },
    {
      title: "EXTRAIRE LES TYPES DANS DES FICHIERS SÉPARÉS",
      description: "Évitez les dépendances circulaires liées aux types",
      example: `// src/types/user.ts\nexport interface User { ... }\n\n// Importez les types directement\nimport type { User } from "@/types/user";`
    }
  ];
  
  suggestions.forEach((suggestion, index) => {
    console.log(chalk.yellow(`${index + 1}. ${suggestion.title}:`));
    console.log(`   ${suggestion.description}.`);
    console.log(chalk.gray(`   Exemple:\n   \`\`\`\n   ${suggestion.example}\n   \`\`\``));
    console.log();
  });
}

module.exports = {
  generateReport,
  generateImprovementSuggestions
};
