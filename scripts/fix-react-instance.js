
#!/usr/bin/env node

/**
 * Script de correction automatique pour les problèmes d'instance React
 * 
 * Ce script remplace automatiquement les imports React directs par des imports
 * depuis ReactInstance dans les fichiers TypeScript/JavaScript.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Configuration
const SRC_DIR = path.join(process.cwd(), 'src');
const DRY_RUN = process.argv.includes('--dry-run');

// Compteurs pour les statistiques
const stats = {
  filesScanned: 0,
  filesModified: 0,
  importsFixes: 0
};

// Expressions régulières pour les corrections
const FIXES = [
  {
    // Remplacer l'import direct de React
    pattern: /import\s+(?:React|{\s*(?:useState|useEffect|useContext|createContext|useMemo|useCallback|useRef|Fragment)(?:\s*,\s*(?:useState|useEffect|useContext|createContext|useMemo|useCallback|useRef|Fragment))*\s*})\s+from\s+['"]react['"]/g,
    replacement: "import { React } from '@/core/ReactInstance'",
    name: "Import React direct"
  },
  {
    // Remplacer l'import de * as React
    pattern: /import\s+\*\s+as\s+React\s+from\s+['"]react['"]/g,
    replacement: "import { React } from '@/core/ReactInstance'",
    name: "Import React avec namespace"
  },
  {
    // Corriger les imports de toast
    pattern: /import\s+(?:{\s*(?:useToast|toast|Toast|ToastProps|ToastActionElement)(?:\s*,\s*(?:useToast|toast|Toast|ToastProps|ToastActionElement))*\s*})\s+from\s+['"]@\/components\/ui\/use-toast['"]/g,
    replacement: "import { useToast, toast, type Toast, type ToastProps, type ToastActionElement } from '@/hooks/use-toast'",
    name: "Import toast circulaire"
  }
];

// Fonction pour scanner et corriger les fichiers
function scanAndFixDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      scanAndFixDirectory(filePath);
      continue;
    }
    
    // Ne traiter que les fichiers JS, JSX, TS et TSX
    if (!['.js', '.jsx', '.ts', '.tsx'].includes(path.extname(file))) {
      continue;
    }
    
    fixFile(filePath);
  }
}

// Fonction pour corriger un fichier
function fixFile(filePath) {
  stats.filesScanned++;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Appliquer chaque correction
  for (const { pattern, replacement, name } of FIXES) {
    const originalContent = content;
    content = content.replace(pattern, (match) => {
      stats.importsFixes++;
      return replacement;
    });
    
    if (content !== originalContent) {
      console.log(`${chalk.yellow('→')} Correction de "${name}" dans ${path.relative(process.cwd(), filePath)}`);
      modified = true;
    }
  }
  
  // Sauvegarder le fichier si modifié et pas en mode dry-run
  if (modified) {
    stats.filesModified++;
    
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, content, 'utf-8');
    }
  }
}

// Fonction principale
function main() {
  console.log(chalk.blue.bold("🔧 Correction automatique des problèmes d'instance React"));
  
  if (DRY_RUN) {
    console.log(chalk.yellow("⚠️ Mode simulation activé - aucun fichier ne sera modifié"));
  }
  
  console.log(chalk.blue(`Analyse du répertoire: ${SRC_DIR}`));
  console.log();
  
  try {
    scanAndFixDirectory(SRC_DIR);
    
    console.log();
    console.log(chalk.green.bold("✅ Analyse terminée"));
    console.log(`Fichiers analysés: ${stats.filesScanned}`);
    console.log(`Fichiers modifiés: ${stats.filesModified}`);
    console.log(`Corrections d'imports effectuées: ${stats.importsFixes}`);
    
    if (DRY_RUN) {
      console.log();
      console.log(chalk.yellow("ℹ️ Exécutez sans --dry-run pour appliquer les modifications"));
    }
  } catch (error) {
    console.error(chalk.red("❌ Erreur lors de la correction:"));
    console.error(error);
    process.exit(1);
  }
}

// Exécuter le script
main();
