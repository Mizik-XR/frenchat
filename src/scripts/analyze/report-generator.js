
/**
 * Générateur de rapports pour l'analyse des contextes et dépendances
 * Formate et affiche les résultats de manière lisible
 */

const chalk = require('chalk');

/**
 * Génère un rapport complet de l'analyse
 * @param {Object} results - Résultats de l'analyse
 * @param {Array} circularDeps - Dépendances circulaires détectées
 * @param {Array} suggestions - Suggestions pour résoudre les problèmes
 */
function generateReport(results, circularDeps, suggestions) {
  console.log('\n============================================');
  console.log(chalk.blue('🔍 RAPPORT D\'ANALYSE DES CONTEXTES ET DÉPENDANCES'));
  console.log('============================================\n');
  
  // Statistiques générales
  console.log(`Fichiers analysés: ${results.filesScanned}`);
  console.log(`Fichiers avec problèmes: ${results.filesWithIssues}`);
  console.log(`Problèmes totaux trouvés: ${results.totalIssues}`);
  console.log(`Dépendances circulaires détectées: ${circularDeps.length}`);
  console.log('\n');
  
  // Problèmes par sévérité
  const highSeverity = results.issues.filter(issue => 
    issue.type === 'direct-context-import' || 
    issue.type === 'react-createcontext'
  );
  
  const mediumSeverity = results.issues.filter(issue => 
    issue.type === 'direct-react-import'
  );
  
  const lowSeverity = results.issues.filter(issue => 
    !highSeverity.includes(issue) && 
    !mediumSeverity.includes(issue)
  );
  
  // Afficher les problèmes critiques
  if (highSeverity.length > 0) {
    console.log(chalk.red('🔴 PROBLÈMES CRITIQUES:'));
    console.log('------------------------------------------');
    highSeverity.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.message} dans ${chalk.cyan(issue.relativePath)}`);
      console.log(`   ${chalk.green('Solution:')} ${issue.suggestion}`);
      console.log();
    });
  }
  
  // Afficher les problèmes moyens
  if (mediumSeverity.length > 0) {
    console.log(chalk.yellow('🟠 PROBLÈMES MOYENS:'));
    console.log('------------------------------------------');
    mediumSeverity.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.message} dans ${chalk.cyan(issue.relativePath)}`);
      console.log(`   ${chalk.green('Solution:')} ${issue.suggestion}`);
      console.log();
    });
  }
  
  // Afficher les problèmes mineurs
  if (lowSeverity.length > 0) {
    console.log(chalk.blue('🟡 PROBLÈMES MINEURS:'));
    console.log('------------------------------------------');
    lowSeverity.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.message} dans ${chalk.cyan(issue.relativePath)}`);
      console.log(`   ${chalk.green('Solution:')} ${issue.suggestion}`);
      console.log();
    });
  }
  
  // Afficher les dépendances circulaires
  if (circularDeps.length > 0) {
    console.log(chalk.magenta('🔄 DÉPENDANCES CIRCULAIRES:'));
    console.log('------------------------------------------');
    circularDeps.forEach((circular, index) => {
      console.log(`${index + 1}. ${chalk.cyan(circular.path)}`);
      const suggestion = suggestions.find(s => s.circularDep === circular);
      if (suggestion) {
        console.log(`   ${chalk.green('Suggestion:')}`);
        console.log(`   ${suggestion.suggestion.split('\n').join('\n   ')}`);
      }
      console.log();
    });
  }
  
  // Recommandations générales
  console.log(chalk.blue('📝 RECOMMANDATIONS GÉNÉRALES:'));
  console.log('------------------------------------------');
  console.log('1. Utilisez toujours { createContext } depuis @/core/ReactInstance');
  console.log('2. Importez React en tant que { React } depuis @/core/ReactInstance');
  console.log('3. Pour éviter les dépendances circulaires, créez des fichiers de types partagés');
  console.log('4. Séparez les hooks en logique pure et intégration UI');
  console.log('\n');
  
  // Pied de page
  console.log('============================================');
  console.log(`Rapport généré le ${new Date().toLocaleString()}`);
  console.log('============================================');
}

module.exports = {
  generateReport
};
