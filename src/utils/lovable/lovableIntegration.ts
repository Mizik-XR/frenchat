
/**
 * Utilitaires pour l'intégration Lovable
 * 
 * Ce fichier contient des fonctions permettant de s'assurer que
 * l'intégration avec Lovable fonctionne correctement.
 */

/**
 * Vérifie si le script Lovable est correctement chargé
 */
export function isLovableLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Vérifier si le script Lovable est présent dans le DOM
  const lovableScripts = document.querySelectorAll('script[src*="gptengineer.js"]');
  if (lovableScripts.length === 0) {
    console.warn("Le script Lovable n'est pas chargé dans le DOM. L'édition AI ne fonctionnera pas.");
    return false;
  }
  
  // Vérifier si l'objet global est disponible
  if (!window.GPTEngineer && !window.__GPTEngineer) {
    console.warn("L'objet global Lovable n'est pas disponible. Le script pourrait ne pas être correctement chargé.");
    return false;
  }
  
  return true;
}

/**
 * Injecte le script Lovable s'il n'est pas déjà présent
 */
export function injectLovableScript(): void {
  if (typeof window === 'undefined') return;
  
  // Ne pas réinjecter si déjà présent
  if (document.querySelector('script[src*="gptengineer.js"]')) {
    console.log("Script Lovable déjà présent, pas besoin de l'injecter");
    return;
  }
  
  console.info("Injection automatique du script Lovable");
  
  const script = document.createElement('script');
  script.src = 'https://cdn.gpteng.co/gptengineer.js';
  script.type = 'module';
  script.async = true;
  script.dataset.injected = 'true';
  
  // Ajouter au début du head pour s'assurer qu'il se charge tôt
  document.head.insertBefore(script, document.head.firstChild);
  
  // Attendre un court instant puis vérifier si le script est chargé
  setTimeout(() => {
    if (!isLovableLoaded()) {
      console.warn("Le script Lovable n'a pas été correctement chargé après injection.");
    } else {
      console.log("Script Lovable injecté et chargé avec succès.");
    }
  }, 1000);
}

/**
 * Initialise l'intégration Lovable
 * Cette fonction peut être appelée au démarrage de l'application
 */
export function initLovableIntegration(): void {
  console.log("Initialisation de l'intégration Lovable...");
  
  // Vérifier si le script est déjà présent
  const isScriptPresent = document.querySelector('script[src*="gptengineer.js"]') !== null;
  
  if (isScriptPresent) {
    console.log("Script Lovable déjà présent, vérification de son état...");
    setTimeout(() => {
      if (!isLovableLoaded()) {
        console.warn("Script Lovable présent mais pas correctement chargé, tentative de réinjection...");
        injectLovableScript();
      }
    }, 500);
    return;
  }

  // Injecter le script si nécessaire
  injectLovableScript();
  
  // Double vérification après le chargement complet du DOM
  window.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('script[src*="gptengineer.js"]')) {
      console.warn("Script Lovable non détecté après DOMContentLoaded, réinjection...");
      injectLovableScript();
    }
  });
  
  // Dernière chance: vérifier après le chargement complet de la page
  window.addEventListener('load', () => {
    if (!document.querySelector('script[src*="gptengineer.js"]')) {
      console.warn("Script Lovable non détecté après load, réinjection finale...");
      injectLovableScript();
    }
  });
}

// Exporter des constantes pour une utilisation facile
export const LOVABLE_SCRIPT_URL = 'https://cdn.gpteng.co/gptengineer.js';
