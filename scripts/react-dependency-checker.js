
#!/usr/bin/env node

/**
 * Script amélioré pour détecter et résoudre les problèmes de dépendances circulaires dans React
 * 
 * Ce script analyse le code source à la recherche de modèles problématiques et
 * fournit des recommandations pour les corriger.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const SRC_DIR = path.join(process.cwd(), 'src');
const PROBLEMATIC_PATTERNS = [
  {
    pattern: /import\s+.*\s+from\s+["']react["']/g,
    type: "Import React direct",
    solution: "Remplacer par: import { React } from '@/core/ReactInstance';"
  },
  {
    pattern: /import\s+.*\s+from\s+["']@\/hooks\/use-toast["']/g,
    type: "Dépendance circulaire potentielle de toast",
    solution: "Restructurer le code pour éviter les imports circulaires avec le système de toast"
  },
  {
    pattern: /createContext(?!\s*=)/g,
    type: "createContext sans ReactInstance",
    solution: "Utiliser React.createContext de '@/core/ReactInstance'"
  },
  {
    pattern: /import\s+.*\s+from\s+["']@\/components\/ui\/use-toast["']/g,
    type: "Import circulaire de toast UI",
    solution: "Importer directement depuis @/hooks/use-toast"
  }
];

// Stockage des résultats
const results = {
  problems: [],
  scanCount: 0,
  circularPaths: []
};

// Fonction récursive pour scanner les fichiers
function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      scanDirectory(filePath);
      continue;
    }
    
    // Ne scanner que les fichiers JS, JSX, TS et TSX
    if (!['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file))) {
      continue;
    }
    
    results.scanCount++;
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Vérifier les modèles problématiques
    for (const { pattern, type, solution } of PROBLEMATIC_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        results.problems.push({
          file: relativePath,
          type,
          solution,
          count: matches.length
        });
      }
    }
    
    // Analyser les imports pour détecter les dépendances circulaires
    detectImports(content, relativePath);
  }
}

// Analyser les importations pour détecter les dépendances potentiellement circulaires
function detectImports(content, filePath) {
  // Rechercher tous les imports
  const importRegex = /import\s+.*\s+from\s+["']([^"']+)["']/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Ne traiter que les imports relatifs ou alias (comme @/...)
    if (importPath.startsWith('./') || importPath.startsWith('../') || importPath.startsWith('@/')) {
      const resolvedPath = resolveImportPath(importPath, filePath);
      if (resolvedPath) {
        // Stocker la relation d'import pour analyse ultérieure
        dependencies.addDependency(filePath, resolvedPath);
      }
    }
  }
}

// Résoudre un chemin d'importation en chemin de fichier réel
function resolveImportPath(importPath, sourceFile) {
  let basePath = path.dirname(sourceFile);
  
  // Gérer les alias (comme @/...)
  if (importPath.startsWith('@/')) {
    importPath = importPath.replace('@/', 'src/');
    basePath = process.cwd();
  }
  
  // Construire le chemin absolu
  let resolvedPath = path.resolve(basePath, importPath);
  
  // Vérifier si le chemin existe directement
  if (fs.existsSync(resolvedPath)) {
    return resolvedPath;
  }
  
  // Essayer d'ajouter des extensions
  for (const ext of ['.js', '.jsx', '.ts', '.tsx']) {
    if (fs.existsSync(resolvedPath + ext)) {
      return resolvedPath + ext;
    }
  }
  
  // Essayer index.js, index.ts, etc.
  for (const ext of ['.js', '.jsx', '.ts', '.tsx']) {
    const indexFile = path.join(resolvedPath, 'index' + ext);
    if (fs.existsSync(indexFile)) {
      return indexFile;
    }
  }
  
  return null;
}

// Gestionnaire de dépendances pour détecter les cycles
const dependencies = {
  graph: {},
  
  addDependency(from, to) {
    if (!this.graph[from]) {
      this.graph[from] = new Set();
    }
    this.graph[from].add(to);
  },
  
  findCircularDependencies() {
    const visited = new Set();
    const recursionStack = new Set();
    const cycles = [];
    
    const detectCycle = (node, path = []) => {
      if (!node || !this.graph[node]) return false;
      
      if (recursionStack.has(node)) {
        const cycleStart = path.indexOf(node);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), node]);
        }
        return true;
      }
      
      if (visited.has(node)) return false;
      
      visited.add(node);
      recursionStack.add(node);
      path.push(node);
      
      const neighbors = this.graph[node];
      for (const neighbor of neighbors) {
        if (detectCycle(neighbor, path)) {
          path.pop();
          recursionStack.delete(node);
          return true;
        }
      }
      
      path.pop();
      recursionStack.delete(node);
      return false;
    };
    
    // Exécuter pour chaque nœud
    for (const node in this.graph) {
      if (!visited.has(node)) {
        detectCycle(node, []);
      }
    }
    
    return cycles;
  }
};

// Fonction principale
function main() {
  console.log(chalk.blue.bold("🔍 Vérification des problèmes de dépendances React"));
  console.log(chalk.blue("Cet outil détecte les problèmes courants qui causent des erreurs d'instance React"));
  console.log();
  
  try {
    scanDirectory(SRC_DIR);
    
    // Détecter les dépendances circulaires
    const circularDeps = dependencies.findCircularDependencies();
    results.circularPaths = circularDeps;
    
    if (results.problems.length === 0 && circularDeps.length === 0) {
      console.log(chalk.green("✅ Aucun problème détecté !"));
      console.log(`Fichiers analysés: ${results.scanCount}`);
    } else {
      // Afficher les problèmes d'importation
      if (results.problems.length > 0) {
        console.log(chalk.yellow.bold(`⚠️ ${results.problems.length} problèmes potentiels détectés:`));
        
        // Regrouper par type de problème
        const byType = results.problems.reduce((acc, problem) => {
          acc[problem.type] = acc[problem.type] || [];
          acc[problem.type].push(problem);
          return acc;
        }, {});
        
        for (const [type, problems] of Object.entries(byType)) {
          console.log(chalk.yellow.bold(`\n🔹 ${type} (${problems.length} occurrences):`));
          console.log(chalk.cyan(`   Solution recommandée: ${problems[0].solution}`));
          console.log("   Fichiers concernés:");
          problems.forEach(p => {
            console.log(`   - ${p.file} (${p.count} occurrences)`);
          });
        }
      }
      
      // Afficher les dépendances circulaires
      if (circularDeps.length > 0) {
        console.log(chalk.red.bold(`\n🔄 ${circularDeps.length} dépendances circulaires détectées:`));
        
        circularDeps.forEach((cycle, i) => {
          console.log(chalk.red(`\nCycle #${i + 1}:`));
          cycle.forEach((file, j) => {
            const relativePath = path.relative(process.cwd(), file);
            const isLast = j === cycle.length - 1;
            console.log(`   ${isLast ? '└─' : '├─'} ${relativePath}`);
            if (!isLast) {
              console.log(`   │  ⬇`);
            }
          });
          console.log(`   └─ (revient au début)`);
        });
        
        console.log(chalk.cyan.bold("\n💡 Suggestions pour résoudre les dépendances circulaires:"));
        console.log("   1. Déplacer les types et interfaces dans des fichiers séparés");
        console.log("   2. Utiliser l'import dynamique (import()) pour briser les cycles");
        console.log("   3. Restructurer le code pour éviter les imports mutuels");
        console.log("   4. Toujours importer React depuis ReactInstance");
      }
      
      console.log();
      console.log(chalk.white.bgBlue(`Fichiers analysés: ${results.scanCount}`));
    }
  } catch (error) {
    console.error(chalk.red("❌ Erreur lors de l'analyse:"));
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
main();
