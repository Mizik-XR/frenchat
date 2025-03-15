
/**
 * Utilitaires pour supporter l'édition avec Lovable
 */

/**
 * Vérifie si le script Lovable est correctement chargé
 * @returns Boolean indiquant si le script est chargé
 */
export function isLovableScriptLoaded(): boolean {
  try {
    // Vérifier si le script est présent dans le document
    const scripts = document.querySelectorAll('script');
    for (const script of scripts) {
      if (script.src && script.src.includes('gptengineer.js')) {
        return true;
      }
    }
  } catch (e) {
    console.error("Erreur lors de la vérification du script Lovable:", e);
  }
  return false;
}

/**
 * Vérifie si Lovable est correctement initialisé
 * @returns Boolean indiquant si Lovable est initialisé
 */
export function isLovableInitialized(): boolean {
  try {
    return typeof (window as any).__GPT_ENGINEER__ !== 'undefined';
  } catch (e) {
    return false;
  }
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

    // Si le script est déjà présent mais non initialisé, le supprimer pour le recharger
    if (isLovableScriptLoaded()) {
      console.log("Script Lovable présent mais non initialisé, tentative de rechargement");
      const scripts = document.querySelectorAll('script');
      for (const script of scripts) {
        if (script.src && script.src.includes('gptengineer.js')) {
          script.remove();
          break;
        }
      }
    }

    console.log("Tentative d'injection du script Lovable");
    const script = document.createElement('script');
    script.src = 'https://cdn.gpteng.co/gptengineer.js';
    script.type = 'module';
    script.async = true;
    script.onload = () => {
      console.log("Script Lovable injecté avec succès, attente de l'initialisation...");
      
      // Vérifier l'initialisation après un court délai
      setTimeout(() => {
        if (isLovableInitialized()) {
          console.log("Script Lovable correctement initialisé");
          resolve();
        } else {
          console.warn("Script Lovable chargé mais non initialisé correctement");
          resolve(); // Résoudre quand même pour ne pas bloquer l'application
        }
      }, 1000);
    };
    
    script.onerror = (err) => {
      console.error("Erreur lors de l'injection du script Lovable", err);
      reject(err);
    };

    document.head.appendChild(script);
  });
}

/**
 * Vérifie l'état de l'intégration Lovable et affiche un diagnostic
 */
export function checkLovableIntegration(): void {
  console.log("--- Diagnostic Lovable ---");
  console.log(`Script chargé: ${isLovableScriptLoaded() ? 'Oui' : 'Non'}`);
  console.log(`Script initialisé: ${isLovableInitialized() ? 'Oui' : 'Non'}`);
  console.log(`URL: ${window.location.href}`);
  console.log(`Navigateur: ${navigator.userAgent}`);
  console.log(`Mode: ${import.meta.env.MODE}`);

  // Vérifier si nous sommes dans un iframe (cas où l'édition peut être problématique)
  if (window !== window.parent) {
    console.log("Avertissement: Application dans un iframe, peut causer des problèmes d'édition");
  }
  
  console.log("------------------------");
}

// Auto-diagnostic quand ce module est importé en mode développement
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Utiliser un délai pour s'assurer que le DOM est complètement chargé
  setTimeout(() => {
    checkLovableIntegration();
  }, 1000);
}
