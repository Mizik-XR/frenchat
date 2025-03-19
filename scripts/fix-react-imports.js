
#!/usr/bin/env node

/**
 * Script d'automatisation pour corriger les imports React manquants
 * 
 * Usage: node scripts/fix-react-imports.js
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// Liste des fichiers nécessitant la correction d'import React
const filesNeedingFix = [
  'src/components/AuthProvider.tsx',
  'src/components/auth/SignInForm.tsx',
  'src/components/auth/SignUpForm.tsx',
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
  'src/components/ui/composite/CompositePanel.tsx',
  'src/components/ui/primitives/PrimitiveButton.tsx',
  'src/components/ui/primitives/PrimitiveCard.tsx',
  'src/components/ui/resizable.tsx',
  'src/components/ui/sidebar.tsx',
  'src/components/ui/sonner.tsx',
  'src/hooks/use-toast.tsx',
  'src/main.tsx',
  'src/pages/Home.tsx',
  'src/utils/startup/errorHandlingUtils.tsx'
];

// Import à ajouter
const IMPORT_STATEMENT = `import { React } from "@/core/ReactInstance";`;

// Statistiques
let fixedCount = 0;
let skippedCount = 0;
let errorCount = 0;

console.log(chalk.blue('🔧 Correction automatique des imports React manquants'));
console.log(chalk.blue('=================================================\n'));

// Traiter chaque fichier
for (const filePath of filesNeedingFix) {
  const fullPath = path.resolve(process.cwd(), filePath);
  
  try {
    // Vérifier si le fichier existe
    if (!fs.existsSync(fullPath)) {
      console.log(chalk.yellow(`⚠️ Fichier non trouvé: ${filePath}`));
      skippedCount++;
      continue;
    }
    
    // Lire le contenu du fichier
    let content = fs.readFileSync(fullPath, 'utf-8');
    
    // Vérifier si l'import existe déjà
    if (content.includes('import { React }') || content.includes('import React')) {
      console.log(chalk.green(`✅ Import React déjà présent: ${filePath}`));
      skippedCount++;
      continue;
    }
    
    // Ajouter l'import en haut du fichier
    // Chercher la position après les commentaires initiaux s'il y en a
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Trouver où insérer l'import (après les commentaires initiaux)
    while (insertIndex < lines.length && 
           (lines[insertIndex].trim() === '' || 
            lines[insertIndex].trim().startsWith('/*') || 
            lines[insertIndex].trim().startsWith('*') || 
            lines[insertIndex].trim().startsWith('*/') || 
            lines[insertIndex].trim().startsWith('//'))) {
      insertIndex++;
    }
    
    // Si nous sommes au début d'un bloc d'imports, ajouter juste à cet endroit
    if (insertIndex < lines.length && lines[insertIndex].startsWith('import')) {
      lines.splice(insertIndex, 0, IMPORT_STATEMENT);
    }
    // Sinon, ajouter l'import suivi d'une ligne vide
    else {
      lines.splice(insertIndex, 0, IMPORT_STATEMENT, '');
    }
    
    // Reconstruire le contenu
    const updatedContent = lines.join('\n');
    
    // Écrire le fichier mis à jour
    fs.writeFileSync(fullPath, updatedContent, 'utf-8');
    
    console.log(chalk.green(`✅ Import React ajouté: ${filePath}`));
    fixedCount++;
    
  } catch (error) {
    console.error(chalk.red(`❌ Erreur lors du traitement de ${filePath}:`), error.message);
    errorCount++;
  }
}

// Résumé
console.log(chalk.blue('\n================================================='));
console.log(chalk.blue('📊 Résumé de la correction automatique'));
console.log(chalk.blue('================================================='));
console.log(`Fichiers corrigés: ${chalk.green(fixedCount)}`);
console.log(`Fichiers ignorés (déjà corrects): ${chalk.yellow(skippedCount)}`);
console.log(`Erreurs: ${chalk.red(errorCount)}`);
console.log(chalk.blue('================================================='));

if (errorCount === 0) {
  console.log(chalk.green('\n✨ Correction terminée avec succès!'));
  
  if (fixedCount > 0) {
    console.log(chalk.blue('\nProchaines étapes recommandées:'));
    console.log('1. Exécutez les tests pour vérifier que tout fonctionne correctement');
    console.log('2. Vérifiez le build avec "npm run build"');
    console.log('3. Utilisez le script "check-context-usage.js" pour une vérification complète');
  }
} else {
  console.log(chalk.yellow('\n⚠️ La correction s\'est terminée avec des erreurs.'));
  console.log(chalk.yellow('Veuillez corriger manuellement les fichiers restants.'));
}
