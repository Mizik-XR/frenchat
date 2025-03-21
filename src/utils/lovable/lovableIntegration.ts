
/**
 * Intégration Lovable - Fonctions d'initialisation et d'intégration
 */

// Initialise l'intégration Lovable au démarrage de l'application
export const initLovableIntegration = () => {
  console.log('Initialisation de l\'intégration Lovable...');
  
  // Vérifier si l'environnement est un environnement Lovable
  const isLovableEnvironment = checkLovableEnvironment();
  
  if (isLovableEnvironment) {
    console.log('Environnement Lovable détecté, activation des fonctionnalités spécifiques');
    setupLovableIntegration();
  } else {
    console.log('Environnement standard détecté');
  }
  
  return isLovableEnvironment;
};

// Vérifie si nous sommes dans un environnement Lovable
const checkLovableEnvironment = (): boolean => {
  // Vérifier si le script Lovable est présent dans le DOM
  const hasLovableScript = document.querySelector('script[src*="gptengineer.js"]') !== null;
  
  // Vérifier si l'objet global Lovable est présent
  const hasLovableGlobal = typeof window !== 'undefined' && 
    (window as any).GPTEngineer !== undefined || 
    (window as any).__GPTEngineer !== undefined;
  
  // Vérifier si l'URL contient des paramètres spécifiques à Lovable
  const urlParams = new URLSearchParams(window.location.search);
  const hasLovableParams = urlParams.has('lovable') || urlParams.has('gpt-engineer');
  
  return hasLovableScript || hasLovableGlobal || hasLovableParams;
};

// Configure l'intégration Lovable
const setupLovableIntegration = () => {
  // Exposer des fonctions ou configurations nécessaires pour Lovable
  if (typeof window !== 'undefined') {
    (window as any).LovableApp = {
      version: import.meta.env.VITE_LOVABLE_VERSION || '1.0.0',
      environment: process.env.NODE_ENV,
      diagnostic: runLovableDiagnostic
    };
  }
  
  // Ajouter des écouteurs d'événements spécifiques à Lovable
  window.addEventListener('message', handleLovableMessages);
  
  console.log('Intégration Lovable configurée avec succès');
};

// Gère les messages provenant de l'interface Lovable
const handleLovableMessages = (event: MessageEvent) => {
  // Vérifier si le message provient de Lovable
  if (event.data && event.data.source === 'lovable') {
    console.log('Message reçu de Lovable:', event.data);
    
    // Traiter les différents types de messages
    switch (event.data.type) {
      case 'REQUEST_APP_INFO':
        // Répondre avec les informations de l'application
        event.source?.postMessage({
          source: 'lovable-app',
          type: 'APP_INFO',
          data: {
            name: 'FileChat',
            version: import.meta.env.VITE_LOVABLE_VERSION || '1.0.0'
          }
        }, '*');
        break;
        
      case 'RELOAD_APP':
        // Recharger l'application
        window.location.reload();
        break;
        
      default:
        // Ignorer les messages inconnus
        break;
    }
  }
};

// Fonction de diagnostic Lovable
const runLovableDiagnostic = () => {
  // Vérifier si le script Lovable est chargé
  const scriptExists = document.querySelector('script[src*="gptengineer.js"]');
  console.log('Script Lovable présent:', Boolean(scriptExists));
  
  // Vérifier la présence de l'objet global
  const hasGlobal = Boolean(
    (window as any).GPTEngineer || (window as any).__GPTEngineer
  );
  console.log('Objet global Lovable présent:', hasGlobal);
  
  return {
    scriptPresent: Boolean(scriptExists),
    globalPresent: hasGlobal,
    status: scriptExists && hasGlobal ? 'OK' : 'PROBLÈME DÉTECTÉ',
    timestamp: new Date().toISOString()
  };
};

// Export de fonctions supplémentaires pour l'intégration Lovable
export const setupLovableAnalytics = () => {
  console.log('Configuration des analytics Lovable');
  // Implémentation de l'analytique spécifique à Lovable
};

export default initLovableIntegration;
