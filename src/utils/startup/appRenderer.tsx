
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
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
 * Rend l'application React dans le DOM
 */
export const renderApp = (rootElement: HTMLElement, queryClient: QueryClient): void => {
  try {
    // S'assurer que createRoot est accessible
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
            <BrowserRouter>
              <App />
            </BrowserRouter>
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
      const element = document.createElement('div');
      element.innerHTML = '<div class="p-4 text-center"><h2>Mode de secours activé</h2><p>Chargement avec méthode alternative...</p></div>';
      rootElement.appendChild(element);
      
      setTimeout(() => {
        window.location.href = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'mode=fallback';
      }, 2000);
    } catch (fallbackError) {
      console.error("Même la méthode de contournement a échoué:", fallbackError);
    }
    
    throw rootError;
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
  const initRendering = () => renderApp(rootElement, queryClient);
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRendering);
  } else {
    initRendering();
  }
};
