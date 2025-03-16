
/**
 * Utilitaires pour un démarrage en mode minimal
 * Conçu pour fonctionner même en cas d'erreur critique d'initialisation
 */

// Fonction pour activer le mode de secours
export function activateSafeMode(): void {
  try {
    // Définir les paramètres de sécurité
    localStorage.setItem('FORCE_CLOUD_MODE', 'true');
    localStorage.setItem('aiServiceType', 'cloud');
    localStorage.setItem('mode', 'safe');
    
    console.log('Mode de secours activé');
  } catch (error) {
    // En cas d'erreur d'accès au localStorage
    console.error('Erreur lors de l\'activation du mode de secours:', error);
    
    // Tenter une redirection vers la page de récupération
    window.location.href = '/recovery.html';
  }
}

// Fonction pour réinitialiser uniquement les paramètres problématiques
export function resetProblemSettings(): void {
  try {
    // Liste des paramètres connus pour causer des problèmes
    const problematicSettings = [
      'useLocalAI', 
      'aiProviderSelection',
      'last_route',
      'lastView',
      'requestedModel',
      'selectedModel',
      'modelConfig',
      'localAIUrl',
      'ollamaModels',
      'aiProvider'
    ];
    
    // Supprimer sélectivement
    problematicSettings.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Activer le mode cloud
    activateSafeMode();
    
    console.log('Paramètres problématiques réinitialisés');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des paramètres:', error);
  }
}

// Fonction pour initialiser le mode de démarrage sécurisé
export function initializeSafeMode(): boolean {
  // Vérifier les paramètres d'URL
  const urlParams = new URLSearchParams(window.location.search);
  
  if (urlParams.get('mode') === 'safe' || urlParams.get('forceCloud') === 'true') {
    console.log('Mode de secours demandé via URL');
    
    // Gestion des réinitialisations
    if (urlParams.get('reset') === 'partial') {
      resetProblemSettings();
    } else if (urlParams.get('reset') === 'true') {
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('Réinitialisation complète effectuée');
      } catch (error) {
        console.error('Erreur lors de la réinitialisation:', error);
      }
    }
    
    // Activer le mode de secours
    activateSafeMode();
    return true;
  }
  
  return false;
}

// Fonction pour vérifier l'environnement et appliquer les paramètres appropriés
export function setupEnvironment(): void {
  // Vérifier si nous sommes dans un environnement de prévisualisation
  const isPreviewEnvironment = 
    window.location.hostname.includes('lovable') || 
    window.location.hostname.includes('preview') ||
    window.location.hostname.includes('netlify');
    
  if (isPreviewEnvironment) {
    console.log('Environnement de prévisualisation détecté');
    activateSafeMode();
  }
}
