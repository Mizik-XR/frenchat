
/**
 * Module utilitaire pour un démarrage simplifié avec moins de dépendances
 * Conçu pour fonctionner même lorsque React échoue
 */

// Fonction pour vérifier l'environnement et réinitialiser les paramètres problématiques
export function resetProblemSettings() {
  try {
    // Paramètres problématiques connus qui pourraient causer des crashes
    const problematicSettings = [
      'useLocalAI', 
      'aiProviderSelection',
      'last_route',
      'lastView',
      'requestedModel',
      'app_loading_issue'
    ];
    
    // Nettoyage sélectif
    problematicSettings.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Forcer le mode cloud qui est plus stable
    localStorage.setItem('FORCE_CLOUD_MODE', 'true');
    localStorage.setItem('aiServiceType', 'cloud');
    localStorage.setItem('mode', 'safe');
    
    console.log('Paramètres problématiques réinitialisés');
    return true;
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    return false;
  }
}

// Fonction pour afficher un message de démarrage simplifié sans dépendances React
export function showSimplifiedStartupScreen() {
  const rootElement = document.getElementById('root') || document.body;
  
  rootElement.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(to bottom right, #f0f9ff, #e1e7ff); font-family: sans-serif;">
      <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; width: 100%; text-align: center;">
        <h1 style="color: #4f46e5; font-size: 1.5rem; margin-bottom: 1rem;">Frenchat - Mode de secours</h1>
        
        <p style="margin-bottom: 1.5rem; color: #4b5563;">
          Un problème a été détecté au démarrage. Nous allons tenter un démarrage simplifié.
        </p>
        
        <div style="width: 100%; height: 6px; background-color: #e5e7eb; border-radius: 3px; overflow: hidden; margin-bottom: 1.5rem;">
          <div style="width: 30%; height: 100%; background-color: #4f46e5; border-radius: 3px; animation: progressAnimation 2s infinite ease-in-out;"></div>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button id="start-safe-mode" style="background-color: #4f46e5; color: white; border: none; padding: 0.75rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Démarrer en mode sécurisé
          </button>
          
          <button id="reset-settings" style="background-color: white; color: #4f46e5; border: 1px solid #4f46e5; padding: 0.75rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Réinitialiser les paramètres
          </button>
          
          <button id="full-reset" style="background-color: white; color: #ef4444; border: 1px solid #ef4444; padding: 0.75rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500; margin-top: 0.5rem;">
            Réinitialisation complète
          </button>
        </div>
      </div>
      
      <style>
        @keyframes progressAnimation {
          0% { width: 10%; }
          50% { width: 70%; }
          100% { width: 10%; }
        }
      </style>
    </div>
  `;
  
  // Ajouter les gestionnaires d'événements
  setTimeout(() => {
    document.getElementById('start-safe-mode')?.addEventListener('click', () => {
      localStorage.setItem('FORCE_CLOUD_MODE', 'true');
      localStorage.setItem('aiServiceType', 'cloud');
      window.location.href = '/?mode=safe&forceCloud=true';
    });
    
    document.getElementById('reset-settings')?.addEventListener('click', () => {
      resetProblemSettings();
      window.location.reload();
    });
    
    document.getElementById('full-reset')?.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = '/?reset=true';
    });
  }, 100);
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
    
    // Afficher l'écran de démarrage simplifié
    showSimplifiedStartupScreen();
    
    return true;
  }
  
  return false;
}
