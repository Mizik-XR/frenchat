
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
 * Force l'injection du script Lovable avec un paramètre de version
 * pour éviter les problèmes de cache
 */
export function forceInjectLovableScript(): void {
  if (typeof window === 'undefined') return;
  
  // Supprimer les anciens scripts s'ils existent
  const oldScripts = document.querySelectorAll('script[src*="gptengineer.js"]');
  oldScripts.forEach(script => script.remove());
  
  console.info("Réinjection forcée du script Lovable");
  
  const script = document.createElement('script');
  const timestamp = new Date().getTime(); // Ajouter un timestamp pour éviter le cache
  script.src = `https://cdn.gpteng.co/gptengineer.js?v=${timestamp}`;
  script.type = 'module';
  script.async = true;
  script.dataset.injected = 'true';
  script.dataset.force = 'true';
  
  // Ajouter au début du head pour s'assurer qu'il se charge tôt
  document.head.insertBefore(script, document.head.firstChild);
  
  // Vérifier après un court délai
  setTimeout(() => {
    if (!isLovableLoaded()) {
      console.error("Le script Lovable n'a pas pu être chargé correctement malgré la réinjection forcée.");
    } else {
      console.log("Script Lovable réinjecté et chargé avec succès");
    }
  }, 2000);
}

/**
 * Injecte le script Lovable s'il n'est pas déjà présent
 */
export function injectLovableScript(): void {
  if (typeof window === 'undefined') return;
  
  // Ne pas réinjecter si déjà présent
  if (document.querySelector('script[src*="gptengineer.js"]')) {
    console.log("Script Lovable déjà présent, vérification de son état...");
    
    // Vérifier si l'objet global est disponible après un court délai
    setTimeout(() => {
      if (!window.GPTEngineer && !window.__GPTEngineer) {
        console.warn("Script présent mais l'objet global n'est pas disponible. Tentative de réinjection forcée...");
        forceInjectLovableScript();
      } else {
        console.log("Script Lovable et objet global correctement chargés");
      }
    }, 1000);
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
  }, 1500);
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
        forceInjectLovableScript();
      } else {
        console.log("Script Lovable correctement chargé et initialisé");
      }
    }, 800);
    return;
  }

  // Injecter le script si nécessaire
  injectLovableScript();
  
  // Double vérification après le chargement complet du DOM
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      if (!isLovableLoaded()) {
        console.warn("Script Lovable non correctement initialisé après DOMContentLoaded, réinjection...");
        forceInjectLovableScript();
      }
    }, 800);
  });
  
  // Dernière chance: vérifier après le chargement complet de la page
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (!isLovableLoaded()) {
        console.warn("Script Lovable non correctement initialisé après load, réinjection finale...");
        forceInjectLovableScript();
      }
    }, 1000);
  });
}

// Exporter des constantes pour une utilisation facile
export const LOVABLE_SCRIPT_URL = 'https://cdn.gpteng.co/gptengineer.js';

// Ajouter une fonction globale pour forcer la réinjection
if (typeof window !== 'undefined') {
  (window as any).forceLovableReload = () => {
    console.log("Réinjection forcée du script Lovable demandée par l'utilisateur");
    forceInjectLovableScript();
    return "Réinjection forcée du script Lovable terminée. Patientez quelques secondes.";
  };
}
