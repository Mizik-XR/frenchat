
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
  try {
    const isDev = import.meta.env.MODE === 'development';
    console.log(`Mode de développement: ${isDev ? 'Activé' : 'Désactivé'}`);
  } catch (e) {
    console.log('Mode de développement: Non détecté');
  }
  
  const hasDevTools = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  console.log(`React DevTools détecté: ${hasDevTools ? 'Oui' : 'Non'}`);
};

// Vérifier que le script est chargé correctement
const checkLovableLoaded = () => {
  if (typeof window.GPTEngineer !== 'undefined' || typeof window.__GPTEngineer !== 'undefined') {
    console.log('✅ Objet global Lovable détecté');
  } else {
    console.log('❌ Objet global Lovable non détecté');
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

// Fonction pour corriger le cache du navigateur
const fixCacheIssues = () => {
  console.log('🔃 Tentative de contournement des problèmes de cache');
  
  // Supprimer les scripts existants
  const existingScripts = document.querySelectorAll('script[src*="gptengineer.js"]');
  existingScripts.forEach(script => script.remove());
  
  // Ajouter un nouveau script avec un paramètre de version pour contourner le cache
  const script = document.createElement('script');
  script.src = `https://cdn.gpteng.co/gptengineer.js?v=${new Date().getTime()}`;
  script.type = 'module';
  document.head.appendChild(script);
  
  return true;
};

// Exécuter le diagnostic au chargement
window.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Diagnostic Lovable démarré');
  hasLovableScript();
  checkDocumentState();
  checkDevMode();
  checkLovableLoaded();
  
  // Tentative de correction automatique
  let fixed = fixLovableScript();
  if (fixed) {
    console.log('✅ Correction appliquée. Rafraîchissez la page pour vérifier.');
  } else {
    // Si le script est présent mais ne fonctionne pas, essayer de contourner le cache
    if (!window.GPTEngineer && !window.__GPTEngineer) {
      console.log('⚠️ Script présent mais non fonctionnel, tentative de contournement du cache');
      fixed = fixCacheIssues();
      if (fixed) {
        console.log('✅ Contournement du cache appliqué. Rafraîchissez la page pour vérifier.');
      }
    } else {
      console.log('✅ Script Lovable présent et fonctionnel.');
    }
  }
});

// Ajouter une fonction globale pour lancer le diagnostic manuellement
window.runLovableDiagnostic = () => {
  console.log('🔄 Diagnostic Lovable manuel démarré');
  hasLovableScript();
  checkDocumentState();
  checkDevMode();
  checkLovableLoaded();
  
  // Si le script ne fonctionne pas, essayer de contourner le cache
  if (!window.GPTEngineer && !window.__GPTEngineer) {
    return fixCacheIssues();
  }
  return fixLovableScript();
};

// Ajouter une fonction pour réinjecter le script sans utiliser le cache
window.forceLovableReload = () => {
  console.log('⚡ Réinjection forcée du script Lovable');
  return fixCacheIssues();
};

console.log('🏁 Script de diagnostic Lovable chargé. Utilisez window.runLovableDiagnostic() pour exécuter manuellement ou window.forceLovableReload() pour forcer la réinjection.');
