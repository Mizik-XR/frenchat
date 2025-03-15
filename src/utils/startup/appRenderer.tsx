
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from '@/App';
import { LoadingScreen } from '@/components/auth/LoadingScreen';
import { renderFallbackScreen } from './errorHandlingUtils';

/**
 * Configure le client de requête pour React Query
 */
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        gcTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false,
      },
    },
  });
};

/**
 * Rend l'application React dans le DOM avec gestion stricte des erreurs
 */
export const renderApp = (rootElement: HTMLElement, queryClient: QueryClient): void => {
  try {
    // Vérifier explicitement que React est défini
    if (typeof React === 'undefined' || !React) {
      console.error("React n'est pas défini");
      throw new Error("React is not defined");
    }

    // Vérifier explicitement que ReactDOM.createRoot est disponible
    if (typeof ReactDOM === 'undefined' || !ReactDOM || typeof ReactDOM.createRoot !== 'function') {
      console.error("ReactDOM.createRoot n'est pas disponible");
      throw new Error("ReactDOM.createRoot is not available");
    }
    
    // S'assurer que createRoot est accessible
    const createRoot = ReactDOM.createRoot;
    if (typeof createRoot !== 'function') {
      console.error("react-dom/client createRoot n'est pas disponible, tentative de contournement...");
      throw new Error("react-dom/client createRoot n'est pas disponible");
    }
    
    const root = createRoot(rootElement);
    
    // Créer l'application dans un bloc try/catch pour détecter les erreurs de rendu
    try {
      root.render(
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </ErrorBoundary>
      );
      console.log("Application React montée avec succès");
    } catch (renderError) {
      console.error("Erreur pendant le rendu initial:", renderError);
      root.render(<LoadingScreen showRetry={true} message="Erreur lors du rendu de l'application" />);
      throw renderError;
    }
  } catch (rootError) {
    console.error("Erreur lors de la création du root React:", rootError);
    
    // Fallback à une méthode alternative si createRoot échoue
    try {
      console.warn("Tentative de contournement avec méthode alternative...");
      
      // Forcer le mode cloud pour éviter les problèmes de connectivité locale
      localStorage.setItem('FORCE_CLOUD_MODE', 'true');
      localStorage.setItem('aiServiceType', 'cloud');
      
      const element = document.createElement('div');
      element.innerHTML = `
        <div class="p-4 text-center">
          <h2>Problème de chargement React détecté</h2>
          <p>Le système bascule automatiquement en mode de secours...</p>
          <div class="mt-4">
            <button onclick="window.location.href = '/?forceCloud=true&mode=cloud'" class="px-4 py-2 bg-blue-500 text-white rounded">
              Mode cloud
            </button>
          </div>
        </div>
      `;
      rootElement.appendChild(element);
      
      setTimeout(() => {
        window.location.href = '/?forceCloud=true&mode=cloud&client=true';
      }, 3000);
    } catch (fallbackError) {
      console.error("Même la méthode de contournement a échoué:", fallbackError);
      renderFallbackScreen(rootElement, "Erreur critique lors du chargement de l'application");
    }
  }
};

/**
 * Lance le rendu de l'application en fonction de l'état du DOM
 */
export const startRendering = (queryClient: QueryClient): void => {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error("Élément #root non trouvé dans le DOM");
  }
  
  console.log("Élément #root trouvé, montage de l'application React");
  
  // S'assurer que le DOM est complètement chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderApp(rootElement, queryClient));
  } else {
    renderApp(rootElement, queryClient);
  }
};
