
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

// Vérifier l'état du chargement du document
const checkDocumentState = () => {
  console.log(`État du document: ${document.readyState}`);
  console.log(`DOM entièrement chargé: ${document.readyState === 'complete' ? 'Oui' : 'Non'}`);
};

// Vérifier si le mode développement est correctement configuré
const checkDevMode = () => {
  const isDev = import.meta.env.MODE === 'development';
  const hasDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  console.log(`Mode de développement: ${isDev ? 'Activé' : 'Désactivé'}`);
  console.log(`React DevTools détecté: ${hasDevTools ? 'Oui' : 'Non'}`);
};

// Vérifier que le script est chargé correctement
const checkLovableLoaded = () => {
  if (typeof window.__LOVABLE_LOADED__ !== 'undefined') {
    console.log('✅ Script Lovable chargé correctement');
  } else {
    console.log('❌ Script Lovable n\'est pas chargé correctement');
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

// Exécuter le diagnostic au chargement
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Diagnostic Lovable démarré');
  hasLovableScript();
  checkDocumentState();
  checkDevMode();
  checkLovableLoaded();
  
  // Tentative de correction automatique
  const fixed = fixLovableScript();
  if (fixed) {
    console.log('✅ Correction appliquée. Rafraîchissez la page pour vérifier.');
  } else {
    console.log('✅ Script Lovable présent, aucune correction nécessaire.');
  }
});

// Ajouter une fonction globale pour lancer le diagnostic manuellement
window.runLovableDiagnostic = () => {
  console.log('🔄 Diagnostic Lovable manuel démarré');
  hasLovableScript();
  checkDocumentState();
  checkDevMode();
  checkLovableLoaded();
  return fixLovableScript();
};

console.log('🏁 Script de diagnostic Lovable chargé. Utilisez window.runLovableDiagnostic() pour exécuter manuellement.');
