
/**
 * Utilitaires pour vérifier et assurer l'intégration Lovable
 */

// Variable pour stocker l'état de l'intégration
let integrationVerified = false;

/**
 * Vérifie si l'intégration Lovable fonctionne correctement
 * @param forceCheck Force une nouvelle vérification même si déjà validée
 * @returns boolean indiquant si l'intégration est valide
 */
export function checkLovableIntegration(forceCheck: boolean = false): boolean {
  // Si déjà vérifié et pas de force check, retourne le résultat précédent
  if (integrationVerified && !forceCheck) {
    return true;
  }

  try {
    // Vérifier si le script gptengineer.js est chargé dans le DOM
    const scripts = document.querySelectorAll('script');
    const lovableScript = Array.from(scripts).find(script => 
      script.src && script.src.includes('gptengineer.js')
    );
    
    if (!lovableScript) {
      console.warn("Script Lovable (gptengineer.js) non trouvé dans le DOM. L'édition pourrait ne pas fonctionner.");
      return false;
    }
    
    // Vérifier si window.__GPT_ENGINEER__ existe (ajouté par le script)
    if (typeof (window as any).__GPT_ENGINEER__ === 'undefined') {
      console.warn("L'objet global __GPT_ENGINEER__ n'est pas défini. Le script pourrait ne pas être chargé correctement.");
      return false;
    }
    
    console.log("Intégration Lovable vérifiée avec succès.");
    integrationVerified = true;
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'intégration Lovable:", error);
    return false;
  }
}

/**
 * Ajoute le script Lovable s'il n'est pas déjà présent
 * @returns Promise qui se résout quand le script est chargé
 */
export function ensureLovableIntegration(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Si l'intégration est déjà vérifiée, résoudre immédiatement
      if (checkLovableIntegration(false)) {
        resolve(true);
        return;
      }
      
      console.warn("Script Lovable manquant ou non initialisé, tentative d'ajout dynamique...");
      
      // Chercher si le script existe déjà
      const scripts = document.querySelectorAll('script');
      const lovableScript = Array.from(scripts).find(script => 
        script.src && script.src.includes('gptengineer.js')
      );
      
      if (lovableScript) {
        console.log("Script Lovable existe déjà, mais semble ne pas être initialisé correctement.");
        // On force un rechargement du script
        lovableScript.remove();
      }
      
      // Ajouter un nouveau script
      const script = document.createElement('script');
      script.src = 'https://cdn.gpteng.co/gptengineer.js';
      script.type = 'module';
      
      // Écouter les événements de chargement
      script.onload = () => {
        console.log("Script Lovable chargé avec succès.");
        // Vérifier après un délai pour laisser le temps à l'initialisation
        setTimeout(() => {
          const isValid = checkLovableIntegration(true);
          resolve(isValid);
        }, 1000);
      };
      
      script.onerror = () => {
        console.error("Échec du chargement du script Lovable.");
        resolve(false);
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error("Erreur lors de l'ajout du script Lovable:", error);
      resolve(false);
    }
  });
}

/**
 * Vérifie l'état de santé global de l'intégration Lovable
 * @returns Un objet contenant les détails de l'état de santé
 */
export function getLovableHealthStatus(): { 
  isScriptLoaded: boolean; 
  isInitialized: boolean; 
  isFunctional: boolean;
  details: string;
} {
  const scripts = document.querySelectorAll('script');
  const lovableScript = Array.from(scripts).find(script => 
    script.src && script.src.includes('gptengineer.js')
  );
  
  const isScriptLoaded = !!lovableScript;
  const isInitialized = typeof (window as any).__GPT_ENGINEER__ !== 'undefined';
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
