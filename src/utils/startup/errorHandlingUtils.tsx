
import React from 'react';
import { createRoot } from 'react-dom/client';
import { LoadingScreen } from '@/components/auth/LoadingScreen';

/**
 * Fonction pour gérer les erreurs de chargement critiques
 */
export const handleLoadError = (error: Error) => {
  console.error("Erreur critique lors du chargement de l'application:", error);
  
  // Afficher un message d'erreur utilisateur avec des options de récupération
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; background: linear-gradient(to bottom right, #f0f9ff, #e1e7ff);">
        <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; width: 100%;">
          <h1 style="color: #4f46e5; font-size: 1.5rem; margin-bottom: 1rem; text-align: center;">FileChat - Erreur de chargement</h1>
          <p style="margin-bottom: 1.5rem; color: #4b5563; text-align: center;">
            Une erreur est survenue lors du chargement de l'application.
          </p>
          <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.8rem; color: #6b7280; overflow-x: auto;">
            ${error?.message || 'Erreur inconnue lors du chargement'}
            <br/>
            URL: ${window.location.href}
            <br/>
            Date: ${new Date().toLocaleString()}
          </div>
          <div style="text-align: center; display: flex; flex-direction: column; gap: 0.5rem;">
            <button onclick="window.location.reload()" style="background-color: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500; margin-bottom: 0.5rem;">
              Rafraîchir la page
            </button>
            <button onclick="window.location.href = '/?mode=cloud&forceCloud=true'" style="background-color: #fff; color: #4f46e5; border: 1px solid #4f46e5; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
              Mode cloud
            </button>
            <button onclick="localStorage.clear(); window.location.reload()" style="background-color: #fff; color: #6b7280; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500; margin-top: 0.5rem;">
              Réinitialiser et redémarrer
            </button>
          </div>
        </div>
      </div>
    `;
  }
};

/**
 * Vérifier les paramètres d'URL pour mode de secours
 */
export const checkForFallbackMode = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('mode') && (
    urlParams.get('mode') === 'fallback' || 
    urlParams.get('mode') === 'cloud'
  );
};

/**
 * Afficher écran de secours en cas de problème de rendu React
 */
export const renderFallbackScreen = (rootElement: HTMLElement, message = "Erreur lors du rendu de l'application") => {
  try {
    if (typeof React === 'undefined' || !React) {
      throw new Error('React is not defined');
    }
    
    // Utiliser le bon import de react-dom/client
    try {
      const root = createRoot(rootElement);
      root.render(<LoadingScreen showRetry={true} message={message} />);
    } catch (error) {
      console.error("Erreur lors du rendu de l'écran de secours avec createRoot:", error);
      // Fallback HTML pur en cas d'échec complet
      rootElement.innerHTML = getHTMLFallbackContent(message);
    }
  } catch (error) {
    console.error("Erreur lors du rendu de l'écran de secours:", error);
    rootElement.innerHTML = getHTMLFallbackContent(message);
  }
};

/**
 * Contenu HTML de secours pour les cas où React ne fonctionne pas du tout
 */
const getHTMLFallbackContent = (message: string): string => {
  return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center; padding: 2rem;">
      <h2 style="color: #4f46e5; font-size: 1.5rem; margin-bottom: 1rem;">Problème de chargement</h2>
      <p style="margin-bottom: 1.5rem; color: #4b5563;">
        ${message || "L'application prend plus de temps que prévu à démarrer ou a rencontré une erreur."}
      </p>
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        <button onclick="window.location.reload()" style="background-color: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
          Réessayer
        </button>
        <button onclick="window.location.href = '/?mode=cloud&forceCloud=true'" style="background-color: white; color: #4f46e5; border: 1px solid #4f46e5; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
          Mode cloud
        </button>
        <button onclick="localStorage.clear(); window.location.href = '/?reset=true'" style="background-color: white; color: #ef4444; border: 1px solid #ef4444; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500; margin-top: 0.5rem;">
          Réinitialisation complète
        </button>
      </div>
    </div>
  `;
};
