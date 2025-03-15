
/**
 * Utilitaires pour l'intégration et l'édition avec Lovable
 */

/**
 * Vérifie si le script Lovable est correctement chargé dans le DOM
 * @returns Boolean indiquant si le script est chargé
 */
export function isLovableScriptLoaded(): boolean {
  // Vérifier si le script est présent dans le document
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.src && script.src.includes('gptengineer.js')) {
      console.log("Script Lovable détecté dans le DOM");
      return true;
    }
  }
  console.warn("Script Lovable non détecté dans le DOM");
  return false;
}

/**
 * Vérifie si l'objet global __GPT_ENGINEER__ est initialisé
 * @returns Boolean indiquant si l'objet est initialisé
 */
export function isLovableInitialized(): boolean {
  const isInitializedDouble = typeof (window as any).__GPT_ENGINEER__ !== 'undefined';
  const isInitializedSingle = typeof (window as any)._GPT_ENGINEER_ !== 'undefined';
  const isInitializedNoUnderscore = typeof (window as any).GPT_ENGINEER !== 'undefined';
  
  console.log("Vérification des variables globales Lovable:");
  console.log("- Double underscore (__GPT_ENGINEER__):", isInitializedDouble);
  console.log("- Single underscore (_GPT_ENGINEER_):", isInitializedSingle);
  console.log("- Sans underscore (GPT_ENGINEER):", isInitializedNoUnderscore);
  
  return isInitializedDouble || isInitializedSingle || isInitializedNoUnderscore;
}

/**
 * Vérifie si l'intégration Lovable est complètement fonctionnelle
 * @returns Diagnostic complet de l'intégration
 */
export function checkLovableIntegration(): {
  isScriptLoaded: boolean;
  isInitialized: boolean;
  isFunctional: boolean;
  details: string;
} {
  const isScriptLoaded = isLovableScriptLoaded();
  const isInitialized = isLovableInitialized();
  const isFunctional = isScriptLoaded && isInitialized;
  
  let details = "";
  if (!isScriptLoaded) {
    details = "Le script gptengineer.js n'est pas chargé dans le DOM";
    console.warn("Le script Lovable n'est pas présent dans le DOM");
  } else if (!isInitialized) {
    details = "Le script est chargé mais l'objet global n'est pas initialisé";
    console.warn("Le script Lovable est chargé mais non initialisé");
  } else {
    details = "L'intégration Lovable semble fonctionnelle";
    console.log("Intégration Lovable fonctionnelle");
  }
  
  return {
    isScriptLoaded,
    isInitialized,
    isFunctional,
    details
  };
}

/**
 * Tente d'injecter le script Lovable s'il n'est pas déjà présent
 * et attend son initialisation avec plusieurs tentatives
 * @returns Une promesse résolue quand le script est injecté et initialisé
 */
export function injectLovableScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    // Si déjà chargé et initialisé, résoudre immédiatement
    if (isLovableScriptLoaded() && isLovableInitialized()) {
      console.log("Script Lovable déjà chargé et initialisé");
      resolve();
      return;
    }

    // Supprimer l'ancien script s'il existe mais n'est pas initialisé
    const oldScript = document.querySelector('script[src*="gptengineer.js"]');
    if (oldScript) {
      console.log("Ancien script Lovable trouvé, suppression pour réinstallation");
      oldScript.remove();
    }

    console.log("Tentative d'injection du script Lovable");
    const script = document.createElement('script');
    script.src = 'https://cdn.gpteng.co/gptengineer.js';
    script.async = false; // Forcer le chargement synchrone
    
    // Fonction pour vérifier l'initialisation avec plusieurs tentatives
    let attempts = 0;
    const maxAttempts = 10; // Augmenté à 10 tentatives
    const checkInitialization = () => {
      attempts++;
      console.log(`Vérification de l'initialisation (tentative ${attempts}/${maxAttempts})...`);
      
      if (isLovableInitialized()) {
        console.log("Script Lovable initialisé avec succès après " + attempts + " tentatives");
        resolve();
        return;
      }
      
      if (attempts >= maxAttempts) {
        console.warn("Script Lovable non initialisé après plusieurs tentatives");
        // On résout quand même pour ne pas bloquer l'application
        resolve();
        return;
      }
      
      // Réessayer après un délai plus long (5 secondes)
      setTimeout(checkInitialization, 5000);
    };
    
    script.onload = () => {
      console.log("Script Lovable chargé, vérification de l'initialisation...");
      // Démarrer la vérification après un court délai
      setTimeout(checkInitialization, 5000);
    };
    
    script.onerror = (err) => {
      console.error("Erreur lors du chargement du script Lovable", err);
      reject(err);
    };

    // Insérer au début du head pour s'assurer qu'il est chargé avant les autres scripts
    document.head.insertBefore(script, document.head.firstChild);
  });
}

/**
 * Force la réinitialisation complète de Lovable
 * Utile en cas de problème persistant
 */
export function forceResetLovable(): Promise<void> {
  console.log("Réinitialisation forcée de Lovable...");
  
  // Supprimer tous les scripts Lovable
  const scripts = document.querySelectorAll('script[src*="gptengineer.js"]');
  scripts.forEach(script => script.remove());
  
  // Supprimer toutes les variantes possibles de l'objet global
  const variants = ['__GPT_ENGINEER__', '_GPT_ENGINEER_', 'GPT_ENGINEER', 'gptEngineer'];
  variants.forEach(variant => {
    try {
      if (typeof (window as any)[variant] !== 'undefined') {
        console.log(`Suppression de l'objet global ${variant}`);
        delete (window as any)[variant];
      }
    } catch (e) {
      console.error(`Erreur lors de la suppression de l'objet global ${variant}`, e);
    }
  });
  
  // Réinjecter le script après un délai
  return new Promise((resolve) => {
    setTimeout(() => {
      injectLovableScript()
        .then(resolve)
        .catch(err => {
          console.error("Erreur lors de la réinitialisation de Lovable", err);
          resolve(); // Résoudre quand même pour ne pas bloquer
        });
    }, 2000);
  });
}

/**
 * Méthode directe d'initialisation de la fonctionnalité d'édition
 * Cette méthode tente de récupérer la situation même si l'objet global n'est pas correctement initialisé
 */
export function directInitializeEditor(): void {
  console.log("Tentative d'initialisation directe de l'éditeur...");
  
  // Vérifier si le script est présent
  if (!isLovableScriptLoaded()) {
    console.warn("Script Lovable non chargé, impossible d'initialiser directement");
    return;
  }
  
  // Si aucune variable globale n'est définie, on tente une initialisation manuelle
  if (!isLovableInitialized()) {
    try {
      console.log("Tentative de définition manuelle de l'objet global");
      
      // Créer un objet global minimal
      (window as any).__GPT_ENGINEER__ = {
        initialized: true,
        version: "fallback",
        timestamp: new Date().toISOString()
      };
      
      console.log("Objet global défini manuellement:", (window as any).__GPT_ENGINEER__);
    } catch (e) {
      console.error("Échec de l'initialisation manuelle:", e);
    }
  }
}
