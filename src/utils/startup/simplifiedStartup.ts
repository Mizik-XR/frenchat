
/**
 * Module utilitaire pour un démarrage simplifié
 */

// Fonction pour réinitialiser les paramètres problématiques
export function resetProblemSettings() {
  try {
    // Paramètres problématiques connus
    const problematicSettings = [
      'useLocalAI', 
      'aiProviderSelection',
      'last_route',
      'lastView',
      'requestedModel'
    ];
    
    // Nettoyage sélectif
    problematicSettings.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Forcer le mode cloud
    localStorage.setItem('FORCE_CLOUD_MODE', 'true');
    localStorage.setItem('aiServiceType', 'cloud');
    
    console.log('Paramètres problématiques réinitialisés');
    return true;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return false;
  }
}

// Mode de démarrage de secours
export function initializeSafeMode() {
  // Vérifier si nous sommes en mode de démarrage sécurisé
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'safe') {
    console.log('Initialisation du mode de démarrage sécurisé');
    
    // Réinitialiser les paramètres problématiques
    if (urlParams.get('reset') === 'partial') {
      resetProblemSettings();
    } else if (urlParams.get('reset') === 'true') {
      localStorage.clear();
    }
    
    // Configurer le mode sécurisé
    localStorage.setItem('FORCE_CLOUD_MODE', 'true');
    localStorage.setItem('aiServiceType', 'cloud');
    localStorage.setItem('mode', 'safe');
    
    return true;
  }
  
  return false;
}
