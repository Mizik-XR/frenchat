
// Script de diagnostic pour les problèmes de build
const fs = require('fs');
const path = require('path');

console.log('🔍 Lancement du diagnostic de build...');

// Vérifier si le dossier src/components/ui existe et est un dossier
const uiComponentsPath = path.resolve(__dirname, 'src/components/ui');
try {
  const stat = fs.statSync(uiComponentsPath);
  console.log(`✅ Le chemin ${uiComponentsPath} existe.`);
  console.log(`📂 Est-ce un dossier? ${stat.isDirectory() ? 'Oui' : 'Non'}`);
  
  if (stat.isDirectory()) {
    // Lister les fichiers du dossier
    const files = fs.readdirSync(uiComponentsPath);
    console.log(`📑 Fichiers dans le dossier (${files.length}):`, files);
  }
} catch (error) {
  console.error(`❌ Erreur lors de l'accès au chemin ${uiComponentsPath}:`, error.message);
}

// Vérifier les imports dans les fichiers TS/TSX
console.log('\n🔎 Recherche des imports potentiellement problématiques...');

function scanDirectory(directory) {
  const items = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(directory, item.name);
    
    if (item.isDirectory()) {
      scanDirectory(fullPath);
    } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const importUIComponentsRegex = /import.*from\s+['"]@\/components\/ui['"]/g;
        const imports = content.match(importUIComponentsRegex);
        
        if (imports && imports.length > 0) {
          console.log(`📄 ${fullPath} contient des imports de components/ui:`, imports);
        }
        
        const wildcardImports = /import\s+\*\s+as/g.test(content);
        if (wildcardImports) {
          console.log(`⚠️ ${fullPath} contient des imports wildcard (*) qui peuvent causer des problèmes.`);
        }
      } catch (err) {
        console.error(`❌ Erreur lors de la lecture de ${fullPath}:`, err.message);
      }
    }
  }
}

try {
  scanDirectory(path.resolve(__dirname, 'src'));
  console.log('✅ Analyse des imports terminée.');
} catch (error) {
  console.error('❌ Erreur lors de l\'analyse des imports:', error.message);
}

console.log('\n🏁 Diagnostic terminé. Utilisez ces informations pour résoudre les problèmes de build.');
