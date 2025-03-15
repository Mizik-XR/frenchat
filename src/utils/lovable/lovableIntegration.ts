
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
    script.async = true;
    script.onload = () => {
      console.log("Script Lovable injecté avec succès");
      resolve();
    };
    script.onerror = (err) => {
      console.error("Erreur lors de l'injection du script Lovable", err);
      reject(err);
    };

    // Insérer en premier dans le head pour assurer qu'il est chargé avant tout autre script
    document.head.insertBefore(script, document.head.firstChild);
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

// Créer un fichier .env.local pour le mode cloud si nécessaire
export function createCloudModeEnvFile(): void {
  if (typeof window !== 'undefined' && window.location.search.includes('forceCloud=true')) {
    console.log("Tentative de création d'un fichier .env.local pour le mode cloud...");
    
    // Stocker en localStorage pour les prochains chargements
    try {
      localStorage.setItem('FORCE_CLOUD_MODE', 'true');
      localStorage.setItem('ENV_CLOUD_MODE', 'true');
      console.log("Paramètres de mode cloud sauvegardés en localStorage");
    } catch (e) {
      console.warn("Impossible de stocker le mode cloud en localStorage:", e);
    }
    
    // Si en développement, tenter de créer un fichier .env.local via API
    try {
      if (import.meta.env.MODE === 'development') {
        const endpoint = '/api/create-env-file';
        fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content: 'VITE_CLOUD_MODE=true\nVITE_ALLOW_LOCAL_AI=false'
          })
        }).then(response => {
          if (response.ok) {
            console.log("Fichier .env.local créé avec succès pour le mode cloud");
          } else {
            console.warn("Échec de la création du fichier .env.local:", response.statusText);
          }
        }).catch(err => {
          console.error("Erreur lors de la création du fichier .env.local:", err);
        });
      }
    } catch (e) {
      console.warn("Erreur lors de la tentative de création du fichier .env.local:", e);
    }
  }
}

// Ajouter un diagnostic au démarrage du module
console.log("Module d'intégration Lovable chargé");
if (typeof window !== 'undefined') {
  // Utiliser un délai pour s'assurer que le DOM est complètement chargé
  setTimeout(() => {
    const diagnostic = getLovableDiagnostic();
    console.log("Diagnostic Lovable:", diagnostic);
    
    // Activer le mode cloud si nécessaire
    createCloudModeEnvFile();
  }, 1000);
}
