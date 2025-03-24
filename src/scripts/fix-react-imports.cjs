#!/usr/bin/env node

/**
 * Script pour corriger automatiquement les imports React.
 * 
 * Analyse les fichiers pour détecter les utilisations de React sans l'import approprié
 * et ajoute l'import de React depuis ReactInstance.
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Liste des fichiers à corriger (issue du rapport d'analyse des dépendances)
const filesToFix = [
  'src/components/ThemeProvider.tsx',
  'src/components/AuthProvider.tsx',
  'src/components/auth/SignInForm.tsx',
  'src/components/auth/SignUpForm.tsx',
  'src/pages/Documents.tsx',
  'src/pages/Config.tsx',
  'src/components/ai-config/AIConfigProvider.tsx',
  'src/components/auth/UserAvatar.tsx',
  'src/components/chat/ChatInput.tsx',
  'src/components/chat/conversation/ConversationItemMenu.tsx',
  'src/components/chat/conversation/ConversationGroup.tsx',
  'src/components/chat/input/InputField.tsx',
  'src/components/chat/layout/ChatContainer.tsx',
  'src/components/config/llm/CustomModelForm.tsx',
  'src/components/ui/skeleton.tsx',
  'src/components/config/llm/components/wizard/LocationSelector.tsx',
  'src/components/config/steps/ConfigurationStep.tsx',
  'src/components/debug/EnvironmentDetection.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/components/landing/NavbarLink.tsx',
  'src/components/ui/resizable.tsx',
  'src/components/ui/sidebar.tsx',
  'src/components/ui/sonner.tsx',
  'src/hooks/use-toast.tsx',
  'src/main.tsx',
  'src/pages/Home.tsx',
  'src/utils/startup/errorHandlingUtils.tsx'
];

// Expression régulière pour détecter si React est déjà importé
const reactImportRegex = /import\s+\{\s*React\s*\}\s+from\s+['"]@\/core\/ReactInstance['"]/;

// Ajouter l'import React
function addReactImport(filePath) {
  try {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    
    // Vérifier si l'import existe déjà
    if (reactImportRegex.test(originalContent)) {
      console.log(chalk.yellow(`${filePath}: Import React déjà présent, aucun changement nécessaire.`));
      return;
    }
    
    // Ajouter l'import React au début du fichier
    const updatedContent = `import { React } from "@/core/ReactInstance";\n${originalContent}`;
    
    // Écrire le fichier mis à jour
    fs.writeFileSync(filePath, updatedContent);
    console.log(chalk.green(`${filePath}: Import React ajouté avec succès.`));
  } catch (error) {
    console.error(chalk.red(`Erreur lors du traitement du fichier ${filePath}: ${error.message}`));
  }
}

// Fonction principale
function main() {
  console.log(chalk.blue('📦 Début de la correction des imports React...'));
  
  let successCount = 0;
  let failCount = 0;
  
  filesToFix.forEach(filePath => {
    const fullPath = path.resolve(process.cwd(), filePath);
    
    if (fs.existsSync(fullPath)) {
      addReactImport(fullPath);
      successCount++;
    } else {
      console.log(chalk.yellow(`${filePath}: Fichier non trouvé, ignoré.`));
      failCount++;
    }
  });
  
  console.log(chalk.blue(`\n✅ Correction terminée: ${successCount} fichiers traités, ${failCount} fichiers non trouvés.`));
}

// Exécuter le script
main(); 