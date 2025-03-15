
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
  const isInitialized = typeof (window as any).__GPT_ENGINEER__ !== 'undefined';
  console.log("Lovable initialisé:", isInitialized);
  return isInitialized;
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
    details = "Le script est chargé mais l'objet global __GPT_ENGINEER__ n'est pas initialisé";
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
 * @returns Une promesse résolue quand le script est injecté
 */
export function injectLovableScript(): Promise<void> {
  return new Promise((resolve, reject) => {
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
    script.type = 'module';
    script.async = true;
    
    script.onload = () => {
      console.log("Script Lovable injecté avec succès");
      // Attendre un court délai pour l'initialisation
      setTimeout(() => {
        const isInitialized = isLovableInitialized();
        if (isInitialized) {
          console.log("Script Lovable initialisé avec succès");
          resolve();
        } else {
          console.warn("Script Lovable chargé mais non initialisé après délai");
          // Résoudre quand même pour éviter de bloquer
          resolve();
        }
      }, 1000);
    };
    
    script.onerror = (err) => {
      console.error("Erreur lors de l'injection du script Lovable", err);
      reject(err);
    };

    // Insérer au début du head pour s'assurer qu'il est chargé avant les autres scripts
    if (document.head.firstChild) {
      document.head.insertBefore(script, document.head.firstChild);
    } else {
      document.head.appendChild(script);
    }
  });
}
