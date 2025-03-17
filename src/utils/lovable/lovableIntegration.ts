
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
  const hasLovableGlobal = 'GPTEngineer' in window || '__GPTEngineer' in window;
  if (!hasLovableGlobal) {
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
  if (document.querySelector('script[src*="gptengineer.js"]')) return;
  
  console.info("Injection automatique du script Lovable");
  
  const script = document.createElement('script');
  script.src = 'https://cdn.gpteng.co/gptengineer.js';
  script.type = 'module';
  script.async = true;
  script.dataset.injected = 'true';
  
  // Ajouter avant le premier script existant pour s'assurer qu'il se charge tôt
  const firstScript = document.querySelector('script');
  if (firstScript) {
    firstScript.parentNode?.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }
}

/**
 * Initialise l'intégration Lovable
 * Cette fonction peut être appelée au démarrage de l'application
 */
export function initLovableIntegration(): void {
  // Injecter le script si nécessaire
  if (typeof window !== 'undefined') {
    // Vérifier si nous sommes en mode production
    const isProduction = process.env.NODE_ENV === 'production';
    
    // En développement ou si explicitement activé, injecter le script
    if (!isProduction || process.env.VITE_ENABLE_LOVABLE === 'true') {
      if (!isLovableLoaded()) {
        injectLovableScript();
      }
      
      // Ajouter un listener pour vérifier périodiquement
      window.addEventListener('load', () => {
        setTimeout(() => {
          if (!isLovableLoaded()) {
            console.warn("Lovable n'a pas été chargé après 3 secondes. Tentative de réinjection...");
            injectLovableScript();
          }
        }, 3000);
      });
    }
  }
}

// Appeler initLovableIntegration lors de l'import de ce module
initLovableIntegration();
