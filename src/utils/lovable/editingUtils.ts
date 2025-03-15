
/**
 * Utilitaires spécifiques pour l'édition et la détection de problèmes Lovable
 */

// Type pour le statut de santé de l'intégration
interface LovableHealthStatus {
  isScriptLoaded: boolean;
  isInitialized: boolean;
  isFunctional: boolean;
  details: string;
}

/**
 * Vérifie si le script Lovable est chargé
 */
export function isLovableScriptLoaded(): boolean {
  const scripts = document.querySelectorAll('script');
  return Array.from(scripts).some(script => 
    script.src && script.src.includes('gptengineer.js')
  );
}

/**
 * Vérifie si l'objet global Lovable est initialisé
 */
export function isLovableInitialized(): boolean {
  return typeof (window as any).__GPT_ENGINEER__ !== 'undefined';
}

/**
 * Vérifie l'intégration complète de Lovable
 */
export function checkLovableIntegration(): LovableHealthStatus {
  const isScriptLoaded = isLovableScriptLoaded();
  const isInitialized = isLovableInitialized();
  const isFunctional = isScriptLoaded && isInitialized;
  
  let details = "";
  
  if (!isScriptLoaded) {
    details = "Le script gptengineer.js n'est pas chargé dans le DOM";
  } else if (!isInitialized) {
    details = "Le script est chargé mais l'objet global __GPT_ENGINEER__ n'est pas initialisé";
  } else {
    details = "L'intégration Lovable semble fonctionnelle";
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
 */
export function injectLovableScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Si le script est déjà chargé et fonctionnel, ne rien faire
    if (isLovableScriptLoaded() && isLovableInitialized()) {
      console.log("Lovable déjà fonctionnel");
      resolve(true);
      return;
    }
    
    // Si le script est chargé mais non initialisé, essayer de le recharger
    if (isLovableScriptLoaded() && !isLovableInitialized()) {
      console.log("Script Lovable présent mais non initialisé, tentative de rechargement");
      
      // Supprimer le script existant
      const scripts = document.querySelectorAll('script');
      const lovableScript = Array.from(scripts).find(script => 
        script.src && script.src.includes('gptengineer.js')
      );
      
      if (lovableScript && lovableScript.parentNode) {
        lovableScript.parentNode.removeChild(lovableScript);
      }
    }
    
    // Créer et ajouter le nouveau script
    console.log("Injection du script Lovable");
    const script = document.createElement('script');
    script.src = 'https://cdn.gpteng.co/gptengineer.js';
    
    script.onload = () => {
      console.log("Script Lovable chargé, vérification de l'initialisation");
      
      // Vérifier après un délai que l'initialisation est complète
      setTimeout(() => {
        const isInitialized = isLovableInitialized();
        console.log("Statut d'initialisation Lovable:", isInitialized);
        resolve(isInitialized);
      }, 1000);
    };
    
    script.onerror = () => {
      console.error("Erreur lors du chargement du script Lovable");
      resolve(false);
    };
    
    // Ajouter au début du head pour s'assurer qu'il est chargé en premier
    document.head.insertBefore(script, document.head.firstChild);
  });
}

/**
 * Force le mode cloud pour l'application
 */
export function forceCloudMode(): void {
  try {
    localStorage.setItem('FORCE_CLOUD_MODE', 'true');
    console.log("Mode cloud forcé via localStorage");
    
    // Redirection avec paramètres de mode cloud
    const url = new URL(window.location.href);
    url.searchParams.set('forceCloud', 'true');
    url.searchParams.set('mode', 'cloud');
    url.searchParams.set('client', 'true');
    
    console.log("Redirection vers le mode cloud:", url.toString());
    window.location.href = url.toString();
  } catch (e) {
    console.error("Erreur lors du forçage du mode cloud:", e);
    
    // Fallback simple si localStorage échoue
    window.location.href = '/?forceCloud=true&mode=cloud&client=true';
  }
}

/**
 * Vérifie et corrige les problèmes courants avec Lovable
 * @returns Promise avec le statut de la correction
 */
export async function fixCommonLovableIssues(): Promise<boolean> {
  console.log("Tentative de correction des problèmes Lovable courants");
  
  // Vérifier l'état actuel
  const initialStatus = checkLovableIntegration();
  
  // Si déjà fonctionnel, rien à faire
  if (initialStatus.isFunctional) {
    console.log("L'intégration Lovable est déjà fonctionnelle");
    return true;
  }
  
  // Étape 1: Injection du script
  console.log("Étape 1: Injection du script Lovable");
  const injectionSuccess = await injectLovableScript();
  
  // Vérifier après l'injection
  const postInjectionStatus = checkLovableIntegration();
  
  if (postInjectionStatus.isFunctional) {
    console.log("Correction réussie! L'intégration Lovable est maintenant fonctionnelle");
    return true;
  }
  
  console.warn("L'injection du script n'a pas résolu complètement les problèmes");
  
  // Étape 2: Considérer le mode cloud comme solution de repli
  console.log("Étape 2: Suggestion du mode cloud comme solution alternative");
  
  return false;
}
