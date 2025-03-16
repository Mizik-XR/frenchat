
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/message-styles.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { initializeReact } from './utils/react/reactGlobalInitializer'

// Initialisation explicite de React avant toute autre opération
initializeReact();

// Création explicite du client QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Fonction sécurisée pour rendre l'application
const renderApp = () => {
  try {
    // Vérifier si nous sommes dans un environnement de prévisualisation
    const isPreviewEnvironment = window.location.hostname.includes('lovable');
    if (isPreviewEnvironment) {
      console.log("Environnement de prévisualisation détecté, activation du mode cloud");
      localStorage.setItem('FORCE_CLOUD_MODE', 'true');
      localStorage.setItem('aiServiceType', 'cloud');
    }
    
    // Vérifier l'élément racine
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      console.error('Élément racine introuvable');
      return;
    }

    // Utiliser createRoot pour le rendu React 18+
    try {
      const root = createRoot(rootElement);
      
      // Wrapper dans une ErrorBoundary pour la gestion des erreurs
      root.render(
        <React.StrictMode>
          <ErrorBoundary>
            <QueryClientProvider client={queryClient}>
              <App />
            </QueryClientProvider>
          </ErrorBoundary>
        </React.StrictMode>
      );
      console.log('Application rendue avec succès');
    } catch (renderError) {
      console.error("Erreur pendant le rendu initial:", renderError);
      
      // Afficher un message d'erreur à l'utilisateur et offrir une option de récupération
      rootElement.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <h1>Erreur de chargement</h1>
          <p>L'application n'a pas pu démarrer correctement.</p>
          <button onclick="window.location.href='/?forceCloud=true&reset=true'" style="padding: 0.5rem 1rem; margin-top: 1rem;">
            Mode de secours (Cloud)
          </button>
        </div>
      `;
    }
  } catch (outerError) {
    console.error("Erreur critique lors du démarrage:", outerError);
    
    // Fallback pour les erreurs très graves
    document.body.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <h1>Erreur critique</h1>
        <p>Une erreur critique s'est produite pendant le démarrage de l'application.</p>
        <button onclick="window.location.href='/?forceCloud=true&reset=true'" style="padding: 0.5rem 1rem; margin-top: 1rem;">
          Redémarrer en mode sécurisé
        </button>
      </div>
    `;
  }
};

// Lancer le rendu seulement quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// Gestionnaire d'erreur global pour les erreurs non capturées
window.addEventListener('error', (event) => {
  console.error('Erreur non gérée:', event.error);
  
  // Vérifier si c'est l'erreur spécifique de createContext
  if (event.message && event.message.includes('createContext')) {
    console.error('Erreur critique détectée avec React.createContext, tentative de récupération...');
    
    // Rediriger vers le mode de secours
    setTimeout(() => {
      window.location.href = '/?forceCloud=true&reset=true';
    }, 3000);
  }
});
