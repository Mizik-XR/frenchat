
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/message-styles.css'
import './styles/chat.css'

// Fonction pour enregistrer les logs détaillés
const logWithTimestamp = (type: string, message: string, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${type}] ${message}`, ...args);
  
  // Stocker dans localStorage pour récupération ultérieure
  try {
    const existingLogs = JSON.parse(localStorage.getItem('filechat_startup_log') || '[]');
    existingLogs.push(`[${timestamp}] [${type}] ${message}`);
    // Limiter à 100 dernières entrées
    localStorage.setItem('filechat_startup_log', JSON.stringify(existingLogs.slice(-100)));
  } catch (e) {
    console.warn("Impossible de stocker les journaux dans localStorage", e);
  }
};

// Exposer les logs à la console
window.showStartupLogs = () => {
  try {
    const logs = JSON.parse(localStorage.getItem('filechat_startup_log') || '[]');
    console.group("FileChat - Logs de démarrage");
    logs.forEach((log: string) => console.log(log));
    console.groupEnd();
    return logs.length;
  } catch (e) {
    console.error("Erreur lors de l'affichage des logs", e);
    return 0;
  }
};

// Journaliser la version du navigateur et l'environnement
logWithTimestamp('ENV', `Démarrage de l'application`);
logWithTimestamp('ENV', `User Agent: ${navigator.userAgent}`);
logWithTimestamp('ENV', `URL: ${window.location.href}`);
logWithTimestamp('ENV', `Paramètres d'URL: ${window.location.search}`);

// Fonction pour arrêter l'animation de chargement
function stopLoadingAnimation() {
  try {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen && loadingScreen.parentNode) {
      loadingScreen.parentNode.removeChild(loadingScreen);
      logWithTimestamp('STARTUP', 'Écran de chargement supprimé');
    }
  } catch (error) {
    console.warn('Erreur lors de la suppression de l\'écran de chargement:', error);
    logWithTimestamp('ERROR', 'Erreur lors de la suppression de l\'écran de chargement', error);
  }
}

// Créer une variable pour signaler que le rendu a commencé
window.appRenderStarted = true;
logWithTimestamp('STARTUP', 'Début du processus de rendu React');

// Ajouter un gestionnaire d'erreur spécifique pour les erreurs de modules
window.addEventListener('error', function(event) {
  if (event.message && event.message.includes('Cannot access') && event.message.includes('before initialization')) {
    logWithTimestamp('CRITICAL', 'Erreur d\'initialisation de module détectée', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
    
    // Afficher un message d'erreur et un bouton de rechargement
    const root = document.getElementById('root');
    if (root) {
      root.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          <div style="background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; text-align: center;">
            <h2 style="color: #e11d48;">Erreur de chargement détectée</h2>
            <p>Une erreur critique a été détectée lors du chargement de l'application.</p>
            <p style="color: #6b7280; font-size: 0.875rem; margin-top: 1rem; word-break: break-all;">${event.message}</p>
            <div style="margin-top: 1.5rem;">
              <button onclick="window.location.reload()" style="background-color: #2563eb; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer; margin-right: 0.5rem;">
                Recharger la page
              </button>
              <button onclick="window.location.href='/?forceCloud=true&client=true'" style="background-color: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">
                Mode cloud
              </button>
            </div>
            <div style="margin-top: 1rem; text-align: left; background: #f1f5f9; padding: 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; max-height: 100px; overflow-y: auto;">
              <p style="margin: 0; font-weight: bold;">Détails techniques:</p>
              <p style="margin: 0; word-break: break-all;">Fichier: ${event.filename}</p>
              <p style="margin: 0;">Position: Ligne ${event.lineno}, Colonne ${event.colno}</p>
            </div>
          </div>
        </div>
      `;
    }
    
    // Empêcher le rendu normal de React
    throw new Error('Arrêt du rendu React suite à une erreur critique de module');
  }
}, true);

// Créer et rendre l'application React
try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Élément root non trouvé dans le DOM');
  }
  
  logWithTimestamp('STARTUP', 'Élément root trouvé, création du root React');
  
  // Créer le root React
  const reactRoot = ReactDOM.createRoot(root);
  
  logWithTimestamp('STARTUP', 'Root React créé, rendu de l\'application');
  
  // Rendre l'application
  reactRoot.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  
  logWithTimestamp('STARTUP', 'Rendu React terminé');
  
  // Après le rendu réussi, supprimer l'écran de chargement
  setTimeout(() => {
    stopLoadingAnimation();
    logWithTimestamp('STARTUP', 'Application chargée avec succès');
  }, 500);
  
  // Signaler que l'application est chargée
  window.appLoaded = true;
  
} catch (error) {
  logWithTimestamp('CRITICAL', 'Erreur lors du rendu de l\'application', error);
  console.error('Erreur lors du rendu de l\'application:', error);
  
  // En cas d'erreur, mettre à jour l'écran de chargement pour afficher un message d'erreur
  const errorMessage = document.querySelector('.error-message');
  const retryButton = document.querySelector('.retry-btn');
  
  if (errorMessage instanceof HTMLElement) {
    errorMessage.textContent = 'Erreur lors du chargement de l\'application: ' + ((error as Error).message || 'Erreur inconnue');
    errorMessage.style.display = 'block';
  }
  
  if (retryButton instanceof HTMLElement) {
    retryButton.style.display = 'inline-block';
  }
  
  // Ajouter un bouton pour voir les logs dans la console
  const root = document.getElementById('root');
  if (root) {
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Afficher les logs';
    debugButton.style.cssText = 'background: #4b5563; color: white; border: none; padding: 8px 16px; border-radius: 4px; margin-top: 16px; cursor: pointer;';
    debugButton.onclick = () => window.showStartupLogs?.();
    
    const debugContainer = document.createElement('div');
    debugContainer.style.cssText = 'display: flex; justify-content: center; margin-top: 16px;';
    debugContainer.appendChild(debugButton);
    
    root.appendChild(debugContainer);
  }
}

// Ajouter un fichier d'environnement global pour éviter des erreurs d'accès
declare global {
  interface Window {
    appRenderStarted?: boolean;
    appLoaded?: boolean;
    showStartupLogs?: () => number;
  }
}
