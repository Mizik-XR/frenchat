
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import './styles/chat.css';
import { initializeLovable } from './utils/lovable/lovableIntegration';
import { LoadingScreen } from '@/components/auth/LoadingScreen';

// Vérifier si le code s'exécute côté client
const isClient = typeof window !== 'undefined';

// Initialiser Lovable au démarrage de l'application
if (import.meta.env.MODE !== 'production') {
  console.log("Initialisation de l'environnement d'édition");
  initializeLovable();
}

// Solution pour éviter les problèmes de rendu
if (isClient) {
  const rootElement = document.getElementById('root');
  
  if (rootElement) {
    // Supprimer l'écran de chargement statique si présent
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 300);
    }
    
    // Fonction pour rendre l'application avec gestion d'erreurs
    const renderApp = () => {
      try {
        const root = ReactDOM.createRoot(rootElement);
        
        // Afficher d'abord un écran de chargement
        root.render(<LoadingScreen message="Initialisation de l'application..." />);
        
        // Charger l'application complète après un court délai
        setTimeout(() => {
          try {
            root.render(
              <React.StrictMode>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </React.StrictMode>
            );
            console.log("Application chargée avec succès");
          } catch (error) {
            console.error("Erreur lors du rendu de l'application:", error);
            root.render(
              <LoadingScreen 
                message="Erreur lors du chargement de l'application" 
                showRetry={true} 
              />
            );
          }
        }, 500); // Délai plus long pour éviter les problèmes de useLayoutEffect
      } catch (error) {
        console.error("Erreur fatale lors de l'initialisation:", error);
        document.body.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px;">
            <h1 style="color: #e11d48; margin-bottom: 1rem;">Erreur critique</h1>
            <p>Impossible de charger l'application. Essayez de rafraîchir la page.</p>
            <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background-color: #4f46e5; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
              Rafraîchir
            </button>
          </div>
        `;
      }
    };
    
    // Initialiser l'application avec récupération d'erreur
    renderApp();
  } else {
    console.error("Élément racine 'root' non trouvé dans le DOM");
  }
} else {
  console.log("Environnement non-client détecté, rendu reporté");
}
