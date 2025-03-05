
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
  console.log("------------------------");
}
