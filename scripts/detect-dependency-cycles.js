
/**
 * Script de détection des dépendances circulaires
 * Utilisez ce script pour identifier les boucles de dépendances dans le projet
 * 
 * Exécution:
 * node scripts/detect-dependency-cycles.js
 */

const fs = require('fs');
const path = require('path');

console.log('=======================================================');
console.log('  ANALYSE DES DÉPENDANCES CIRCULAIRES');
console.log('=======================================================');

// Fonction pour extraire les imports d'un fichier
function extractImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    
    // Extraction des imports ES6
    const importRegex = /import\s+(?:(?:{[^}]*}|\*\s+as\s+[^,]*|[^,{}\s*]+)(?:\s*,\s*(?:{[^}]*}|\*\s+as\s+[^,]*|[^,{}\s*]+))*\s+from\s+)?['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1];
      if (!importPath.startsWith('.')) continue; // Ignorer les imports de packages
      
      // Résoudre le chemin relatif
      const dir = path.dirname(filePath);
      let resolvedPath;
      
      if (importPath.startsWith('.')) {
        resolvedPath = path.resolve(dir, importPath);
        
        // Ajouter l'extension si nécessaire
        if (!path.extname(resolvedPath)) {
          const extensions = ['.ts', '.tsx', '.js', '.jsx'];
          for (const ext of extensions) {
            const withExt = resolvedPath + ext;
            if (fs.existsSync(withExt)) {
              resolvedPath = withExt;
              break;
            }
            
            // Vérifier aussi les index.*
            const indexFile = path.join(resolvedPath, `index${ext}`);
            if (fs.existsSync(indexFile)) {
              resolvedPath = indexFile;
              break;
            }
          }
        }
      } else {
        resolvedPath = importPath; // Import absolu
      }
      
      imports.push(resolvedPath);
    }
    
    return imports;
  } catch (error) {
    console.error(`Erreur lors de l'analyse de ${filePath}:`, error.message);
    return [];
  }
}

// Construire le graphe de dépendances
const dependencyGraph = {};

function buildDependencyGraph(dir, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory() && !entry.name.startsWith('node_modules') && !entry.name.startsWith('.')) {
      buildDependencyGraph(fullPath, extensions);
    } else if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
      const imports = extractImports(fullPath);
      dependencyGraph[fullPath] = imports;
    }
  }
}

// Détecter les cycles dans le graphe
function detectCycles() {
  const visited = new Set();
  const recursionStack = new Set();
  const cycles = [];
  
  function dfs(node, path = []) {
    if (recursionStack.has(node)) {
      const cycleStart = path.findIndex(n => n === node);
      if (cycleStart !== -1) {
        const cycle = path.slice(cycleStart).concat(node);
        cycles.push(cycle);
      }
      return;
    }
    
    if (visited.has(node)) return;
    
    visited.add(node);
    recursionStack.add(node);
    path.push(node);
    
    const dependencies = dependencyGraph[node] || [];
    for (const dep of dependencies) {
      dfs(dep, [...path]);
    }
    
    recursionStack.delete(node);
  }
  
  for (const node in dependencyGraph) {
    if (!visited.has(node)) {
      dfs(node);
    }
  }
  
  return cycles;
}

// Analyser le projet
console.log('Analyse des fichiers du projet...');
const srcDir = path.join(__dirname, '..', 'src');
buildDependencyGraph(srcDir);

console.log(`Analyse terminée. ${Object.keys(dependencyGraph).length} fichiers scannés.`);
console.log('Détection des cycles de dépendances...');

const cycles = detectCycles();

if (cycles.length === 0) {
  console.log('Aucun cycle de dépendances détecté.');
} else {
  console.log(`${cycles.length} cycles de dépendances détectés:`);
  
  cycles.forEach((cycle, index) => {
    console.log(`\nCycle #${index + 1}:`);
    cycle.forEach(node => {
      console.log(`  - ${path.relative(process.cwd(), node)}`);
    });
  });
  
  console.log('\nRecommandations pour résoudre les cycles:');
  console.log('1. Extraire la logique partagée dans des modules utilitaires');
  console.log('2. Utiliser l\'injection de dépendances plutôt que les imports directs');
  console.log('3. Restructurer les composants pour éviter les références croisées');
}

console.log('\n=======================================================');
