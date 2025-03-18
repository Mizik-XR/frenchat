
// Script de diagnostic pour résoudre les problèmes d'édition Lovable
console.log("🔍 Lancement du diagnostic d'intégration Lovable...");

// Vérifier si le script Lovable est présent dans le document
const hasLovableScript = () => {
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.src && script.src.includes('gptengineer.js')) {
      console.log('✅ Script Lovable trouvé dans le document');
      return true;
    }
  }
  console.log('❌ Script Lovable manquant dans le document');
  return false;
};

// Vérifier si le mode développement est correctement configuré
const checkDevMode = () => {
  const isDev = import.meta.env.MODE === 'development';
  const hasDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  console.log(`Mode de développement: ${isDev ? 'Activé' : 'Désactivé'}`);
  console.log(`React DevTools détecté: ${hasDevTools ? 'Oui' : 'Non'}`);
};

// Vérifier l'état de l'initialisation de l'application
const checkAppInitialization = () => {
  if (window.__FILECHAT_APP__) {
    console.log('✅ L\'objet global __FILECHAT_APP__ est initialisé');
    console.log(`Initialisation effectuée le: ${window.__FILECHAT_APP__.diagnostics.setupRun}`);
    console.log(`Erreurs d'initialisation: ${window.__FILECHAT_APP__.diagnostics.errors.length}`);
  } else {
    console.log('❌ L\'objet global __FILECHAT_APP__ n\'est pas initialisé');
  }
};

// Fonction pour ajouter le script Lovable s'il est manquant
const fixLovableScript = () => {
  if (!hasLovableScript()) {
    console.log('🔧 Ajout du script Lovable manquant');
    const script = document.createElement('script');
    script.src = 'https://cdn.gpteng.co/gptengineer.js';
    script.type = 'module';
    document.head.appendChild(script);
    return true;
  }
  return false;
};

// Exécuter le diagnostic et les corrections au chargement
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Diagnostic Lovable démarré');
  hasLovableScript();
  checkDevMode();
  checkAppInitialization();
  
  // Tentative de correction automatique
  const fixed = fixLovableScript();
  if (fixed) {
    console.log('✅ Correction appliquée. Rafraîchissez la page pour vérifier.');
  } else {
    console.log('✅ Aucune correction nécessaire pour l\'intégration Lovable.');
  }
});

// Exporter la fonction de diagnostic pour une utilisation via la console
window.runLovableDiagnostic = () => {
  console.log('🔄 Diagnostic Lovable manuel démarré');
  hasLovableScript();
  checkDevMode();
  checkAppInitialization();
  return fixLovableScript();
};

console.log('🏁 Script de diagnostic Lovable chargé. Utilisez window.runLovableDiagnostic() pour exécuter manuellement.');
