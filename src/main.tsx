/**
 * Point d'entrée principal de l'application
 * 
 * Ce fichier est optimisé pour:
 * - Éviter les dépendances circulaires
 * - Assurer une seule instance de React
 * - Fournir une gestion d'erreur robuste
 * - Démarrer l'application dans différents modes (normal, récupération, cloud)
 */

// Importer React depuis l'instance unique
import { React } from '@/core/ReactInstance';
import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/message-styles.css';

// Importer l'application après avoir initialisé React
import App from './App';

// Variables d'environnement et modes
const isRecoveryMode = import.meta.env.RECOVERY_MODE === 'true' || 
                     window.location.search.includes('recovery=true');
const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true' || 
                  window.location.search.includes('debug=true');
const isCloudMode = import.meta.env.VITE_CLOUD_MODE === 'true' || 
                  window.location.search.includes('cloud=true');

// Logger de diagnostic
const diagnosticLog = (message: string, type: 'info' | 'error' | 'warning' = 'info') => {
  if (isDebugMode) {
    const styles = {
      info: 'color: #3498db; font-weight: bold;',
      error: 'color: #e74c3c; font-weight: bold;',
      warning: 'color: #f39c12; font-weight: bold;'
    };
    
    console.log(`%c[FileChat] ${message}`, styles[type]);
  }
};

// Configuration améliorée pour le démarrage
const renderApp = () => {
  diagnosticLog(`Initialisation de l'application...`);
  diagnosticLog(`Mode récupération: ${isRecoveryMode ? 'Activé' : 'Désactivé'}`);
  diagnosticLog(`Mode debug: ${isDebugMode ? 'Activé' : 'Désactivé'}`);
  diagnosticLog(`Mode cloud: ${isCloudMode ? 'Activé' : 'Désactivé'}`);
  
  // Afficher la version de React
  diagnosticLog(`React version: ${React.version}`);
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    diagnosticLog('Élément racine introuvable', 'error');
    return;
  }

  try {
    // Créer le root React
    const root = createRoot(rootElement);
    
    diagnosticLog('Root React créé avec succès');
    
    // Fonction pour gérer les erreurs de rendu
    const handleRenderError = (error: Error) => {
      diagnosticLog(`Erreur de rendu: ${error.message}`, 'error');
      console.error(error);
      
      // Afficher un message d'erreur convivial
      rootElement.innerHTML = `
        <div style="text-align: center; padding: 2rem; font-family: system-ui, sans-serif;">
          <h1 style="color: #e74c3c;">Erreur de chargement</h1>
          <p>L'application n'a pas pu démarrer correctement.</p>
          <div style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem; text-align: left;">
            <code>${error.message}</code>
          </div>
          <div style="margin-top: 2rem;">
            <a href="?recovery=true" style="display: inline-block; background: #3498db; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; text-decoration: none; margin-right: 1rem;">
              Démarrer en mode récupération
            </a>
            <a href="?cloud=true" style="display: inline-block; background: #2ecc71; color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; text-decoration: none;">
              Démarrer en mode cloud
            </a>
          </div>
        </div>
      `;
    };
    
    try {
      // Rendu de l'application
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>,
      );
      diagnosticLog('Application rendue avec succès', 'info');
    } catch (error) {
      handleRenderError(error as Error);
    }
  } catch (error) {
    diagnosticLog('Erreur lors de la création du root React', 'error');
    console.error('Erreur lors du rendu de l\'application:', error);
    
    // Afficher un message d'erreur basique si createRoot échoue
    rootElement.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h1>Erreur critique</h1>
        <p>React n'a pas pu être initialisé correctement.</p>
        <p>Essayez de rafraîchir la page ou de vider le cache du navigateur.</p>
      </div>
    `;
  }
};

// Gestionnaire d'erreurs global pour les erreurs non capturées
window.addEventListener('error', (event) => {
  diagnosticLog(`Erreur non capturée: ${event.message}`, 'error');
  
  // Ne pas surcharger la console en mode développement
  if (!isDebugMode) return;
  
  console.error('Détails de l\'erreur:', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error
  });
});

// Gestionnaire pour les rejets de promesses non gérés
window.addEventListener('unhandledrejection', (event) => {
  diagnosticLog(`Promesse non gérée rejetée: ${event.reason}`, 'error');
  
  if (isDebugMode) {
    console.error('Détails du rejet de promesse:', event.reason);
  }
});

// Initialisation de l'application
if (document.readyState === 'loading') {
  // Si le DOM n'est pas encore prêt, attendre l'événement DOMContentLoaded
  document.addEventListener('DOMContentLoaded', renderApp);
  diagnosticLog('En attente du chargement du DOM...', 'info');
} else {
  // Si le DOM est déjà prêt, exécuter immédiatement
  renderApp();
}

// Ajouter un indicateur pour faciliter le débogage
if (isDebugMode) {
  console.log(
    '%cFileChat - Mode débogage activé',
    'color: white; background: #3498db; padding: 5px; border-radius: 3px; font-weight: bold;'
  );
  
  // Ajouter un objet global pour le débogage
  (window as any).__FILECHAT_DEBUG__ = {
    isRecoveryMode,
    isDebugMode,
    isCloudMode,
    reactVersion: React.version,
    checkReact: () => {
      try {
        const testComponent = React.createElement('div', null, 'Test');
        return testComponent !== null;
      } catch (e) {
        return false;
      }
    }
  };
}
