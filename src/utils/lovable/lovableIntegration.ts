
/**
 * Utilitaire pour l'intégration et la gestion de l'éditeur Lovable
 */

/**
 * Vérifie si le script Lovable est correctement chargé
 * @returns Boolean indiquant si le script est chargé
 */
export function isLovableLoaded(): boolean {
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
    if (isLovableLoaded()) {
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
 * Vérifie l'état de l'intégration Lovable et retourne un diagnostic
 * @returns Un objet contenant les informations de diagnostic
 */
export function getLovableDiagnostic(): { 
  isLoaded: boolean; 
  url: string;
  userAgent: string;
  isIframe: boolean;
  mode: string;
} {
  return {
    isLoaded: isLovableLoaded(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    isIframe: typeof window !== 'undefined' ? window !== window.parent : false,
    mode: import.meta.env.MODE
  };
}

/**
 * Initialise Lovable automatiquement si nécessaire
 */
export function initializeLovable(): void {
  // Vérifier si on est en mode développement
  if (import.meta.env.MODE === 'production') {
    return; // Ne pas initialiser en production
  }
  
  // Vérifier si le script est déjà chargé
  if (!isLovableLoaded()) {
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

// Ajouter un diagnostic au démarrage du module
console.log("Module d'intégration Lovable chargé");
if (typeof window !== 'undefined') {
  // Utiliser un délai pour s'assurer que le DOM est complètement chargé
  setTimeout(() => {
    const diagnostic = getLovableDiagnostic();
    console.log("Diagnostic Lovable:", diagnostic);
  }, 1000);
}
