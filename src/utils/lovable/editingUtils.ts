
/**
 * Utilitaires pour supporter l'édition avec Lovable
 */

/**
 * Vérifie si le script Lovable est correctement chargé
 * @returns Boolean indiquant si le script est chargé
 */
export function isLovableScriptLoaded(): boolean {
  // Vérifier si le script est présent dans le document
  const scripts = document.querySelectorAll('script');
  for (const script of scripts) {
    if (script.src && script.src.includes('gptengineer.js')) {
      return true;
    }
  }
  return false;
}

/**
 * Tente d'injecter le script Lovable s'il n'est pas déjà présent
 * @returns Une promesse résolue quand le script est injecté
 */
export function injectLovableScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (isLovableScriptLoaded()) {
      console.log("Script Lovable déjà chargé");
      resolve();
      return;
    }

    console.log("Tentative d'injection du script Lovable");
    const script = document.createElement('script');
    script.src = 'https://cdn.gpteng.co/gptengineer.js';
    script.type = 'module';
    script.async = true;
    script.onload = () => {
      console.log("Script Lovable injecté avec succès");
      resolve();
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
  console.log(`URL: ${window.location.href}`);
  console.log(`Navigateur: ${navigator.userAgent}`);
  console.log(`Mode: ${import.meta.env.MODE}`);
  console.log(`GPTEngineer global: ${typeof window.GPTEngineer !== 'undefined' ? 'Présent' : 'Absent'}`);
  console.log(`__GPTEngineer global: ${typeof window.__GPTEngineer !== 'undefined' ? 'Présent' : 'Absent'}`);

  // Vérifier si nous sommes dans un iframe (cas où l'édition peut être problématique)
  if (window !== window.parent) {
    console.log("Avertissement: Application dans un iframe, peut causer des problèmes d'édition");
  }
  
  console.log("------------------------");
}

/**
 * Initialise Lovable automatiquement si nécessaire
 */
export function initializeLovable(): void {
  // Vérifier si le script est déjà chargé
  if (!isLovableScriptLoaded()) {
    console.log("Lovable non détecté, injection automatique...");
    injectLovableScript()
      .then(() => {
        console.log("Lovable initialisé avec succès");
      })
      .catch((err) => {
        console.error("Échec de l'initialisation de Lovable:", err);
      });
  } else {
    console.log("Lovable déjà initialisé");
  }
}

// Auto-initialisation quand ce module est importé
if (typeof window !== 'undefined') {
  // Utiliser un délai pour s'assurer que le DOM est complètement chargé
  setTimeout(() => {
    checkLovableIntegration();
  }, 1000);
}
