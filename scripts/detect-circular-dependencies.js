
/**
 * Script de détection des dépendances circulaires
 * Détecter les imports circulaires qui peuvent causer des erreurs avec React
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Configuration
const PROBLEMATIC_PATTERNS = [
  {
    pattern: /from ["']@\/hooks\/use-toast["']/,
    type: "Toast Dependency",
    solution: "Organize imports to avoid circular dependencies with toast system"
  },
  {
    pattern: /from ["']react["']/,
    type: "Direct React Import",
    solution: "Use { React } from '@/core/ReactInstance' instead"
  },
  {
    pattern: /React\.createContext/,
    type: "Context Creation",
    solution: "Make sure React is properly imported from ReactInstance"
  }
];

// Stockage des résultats
const results = {
  problems: [],
  scanCount: 0
};

// Fonction pour scanner les fichiers
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      scanDirectory(filePath);
      continue;
    }
    
    // Ne scanner que les fichiers JS et TS
    if (!['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file))) {
      continue;
    }
    
    results.scanCount++;
    
    // Lire le contenu du fichier
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Vérifier les modèles problématiques
    for (const { pattern, type, solution } of PROBLEMATIC_PATTERNS) {
      if (pattern.test(content)) {
        results.problems.push({
          file: path.relative(ROOT_DIR, filePath),
          type,
          solution
        });
      }
    }
  }
}

// Exécuter l'analyse
console.log('Scanning for circular dependencies and React issues...');
scanDirectory(SRC_DIR);

// Afficher les résultats
console.log(`\nScanned ${results.scanCount} files`);

if (results.problems.length === 0) {
  console.log('✅ No issues found!');
} else {
  console.log(`⚠️ Found ${results.problems.length} potential issues:`);
  
  const groupedProblems = results.problems.reduce((acc, problem) => {
    acc[problem.type] = acc[problem.type] || [];
    acc[problem.type].push(problem);
    return acc;
  }, {});
  
  for (const [type, problems] of Object.entries(groupedProblems)) {
    console.log(`\n${type} (${problems.length} occurrences):`);
    console.log(`Solution: ${problems[0].solution}`);
    console.log('Files affected:');
    problems.forEach(p => console.log(`  - ${p.file}`));
  }
  
  console.log('\nRun fix-react-issues.sh to attempt automatic fixes');
  process.exit(1);
}
