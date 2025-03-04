
/**
 * Utility functions for handling application errors and resource loading issues
 */

import { toast } from '@/hooks/use-toast';
import { createRoot } from 'react-dom/client';

/**
 * Creates a user-friendly error message HTML to display when critical errors occur
 */
export const createErrorDisplay = (error: any): string => {
  return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; background: linear-gradient(to bottom right, #f0f9ff, #e1e7ff);">
      <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; width: 100%;">
        <h1 style="color: #4f46e5; font-size: 1.5rem; margin-bottom: 1rem; text-align: center;">FileChat - Erreur de chargement</h1>
        <p style="margin-bottom: 1.5rem; color: #4b5563; text-align: center;">
          Une erreur est survenue lors du chargement de l'application. Veuillez rafraîchir la page ou réessayer plus tard.
        </p>
        <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.8rem; color: #6b7280; overflow-x: auto;">
          ${error?.message || 'Erreur inconnue lors du chargement'}
          <br/>
          URL: ${window.location.href}
          <br/>
          Date: ${new Date().toLocaleString()}
        </div>
        <div style="text-align: center;">
          <button onclick="window.location.reload()" style="background-color: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
            Rafraîchir la page
          </button>
        </div>
      </div>
    </div>
  `;
};

/**
 * Handles critical application load errors by displaying a user-friendly message
 */
export const handleLoadError = (error: any) => {
  console.error("Erreur critique lors du chargement de l'application:", error);
  
  // Afficher un message d'erreur utilisateur
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = createErrorDisplay(error);
  }
};

/**
 * Sets up network status monitoring with toast notifications
 */
export const setupNetworkMonitoring = () => {
  // Surveiller les problèmes de connexion
  window.addEventListener('online', () => {
    toast({
      title: "Connexion rétablie",
      description: "Votre connexion Internet a été rétablie."
    });
  });
  
  window.addEventListener('offline', () => {
    toast({
      title: "Connexion perdue",
      description: "Votre connexion Internet semble interrompue.",
      variant: "destructive"
    });
  });
};

/**
 * Verifies if React and ReactDOM are properly loaded
 */
export const verifyReactLoaded = () => {
  try {
    // Vérifier que React est bien défini
    const React = window.React || globalThis.React;
    if (!React || !React.createElement) {
      console.error("React n'est pas correctement chargé");
      return false;
    }
    
    // Vérifier que createRoot de ReactDOM est bien défini
    // Ici, nous vérifions si la fonction est disponible dans le scope global
    if (typeof createRoot !== 'function') {
      console.error("ReactDOM.createRoot n'est pas disponible");
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification de React:", error);
    return false;
  }
};
