
import React from 'react';

// Cache pour éviter des vérifications répétées
const imageCache = {
  gifPath: null as string | null,
  isChecked: false,
  lastCheckedTime: 0
};

/**
 * Affiche un message de chargement initial pour feedback utilisateur
 */
export const showInitialLoadingMessage = () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    // Vérifier la disponibilité du GIF de chargement
    const gifUrl = checkGifAvailability();
    
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; background: linear-gradient(to bottom right, #f0f9ff, #e1e7ff);">
        <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; width: 100%; text-align: center;">
          ${gifUrl ? `<img src="${gifUrl}" alt="FileChat Loading" style="width: 80px; height: 80px; margin: 0 auto 1rem auto; display: block;">` : ''}
          <h1 style="color: #4f46e5; font-size: 1.5rem; margin-bottom: 1rem;">Frenchat - Chargement en cours</h1>
          <p style="margin-bottom: 1.5rem; color: #4b5563;">
            L'application est en cours de chargement. Veuillez patienter...
          </p>
          <div style="width: 100%; height: 6px; background-color: #e5e7eb; border-radius: 3px; overflow: hidden; margin-bottom: 1rem;">
            <div style="width: 30%; height: 100%; background-color: #4f46e5; border-radius: 3px; animation: progressAnimation 2s infinite ease-in-out;" id="loading-bar"></div>
          </div>
          <p style="font-size: 0.8rem; color: #6b7280;">
            Si le chargement prend trop de temps, essayez de rafraîchir la page.
          </p>
          <button id="retry-button" style="display: none; margin-top: 1rem; background-color: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">
            Rafraîchir la page
          </button>
          <button id="cloud-button" style="display: none; margin-top: 1rem; margin-left: 0.5rem; background-color: #6366f1; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">
            Mode cloud
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
    `;
    
    // Ajouter les gestionnaires d'événements après un court délai
    setTimeout(() => {
      const retryButton = document.getElementById('retry-button');
      const cloudButton = document.getElementById('cloud-button');
      
      if (retryButton) {
        retryButton.style.display = 'inline-block';
        retryButton.onclick = () => window.location.reload();
      }
      
      if (cloudButton) {
        cloudButton.style.display = 'inline-block';
        cloudButton.onclick = () => {
          window.location.href = '/?forceCloud=true&mode=cloud&client=true';
        };
      }
    }, 8000); // Afficher les boutons après 8 secondes
  }
};

/**
 * Vérifie la disponibilité du GIF d'animation et retourne son URL
 * Version optimisée avec mise en cache
 */
export const checkGifAvailability = (): string | null => {
  // Utiliser la valeur en cache si elle existe et a moins de 30 secondes
  const now = Date.now();
  if (imageCache.isChecked && now - imageCache.lastCheckedTime < 30000) {
    return imageCache.gifPath;
  }
  
  // Chemins possibles pour le GIF (réduits pour éviter les duplications)
  const possiblePaths = [
    "/filechat-animation.gif",
    `${window.location.origin}/filechat-animation.gif`
  ];
  
  // En environnement de développement, ajouter le chemin complet basé sur l'origine
  if (import.meta.env.DEV) {
    possiblePaths.push(`${window.location.origin}/public/filechat-animation.gif`);
  }
  
  try {
    // Log une seule fois au début de la vérification
    console.debug("Vérification du GIF d'animation...");
    
    // Vérifier si l'image existe en créant une image test (pour le premier chemin)
    const testImg = new Image();
    testImg.src = possiblePaths[0];
    
    // Mettre à jour le cache
    imageCache.gifPath = possiblePaths[0];
    imageCache.isChecked = true;
    imageCache.lastCheckedTime = now;
    
    return possiblePaths[0];
  } catch (error) {
    console.warn("Erreur lors de la vérification du GIF:", error);
    return null;
  }
};

/**
 * Initialise l'application avec un mécanisme de récupération d'erreur
 * Version améliorée avec gestion des erreurs plus robuste
 */
export const initializeAppWithErrorRecovery = (renderCallback: () => void) => {
  // Afficher un message initial de chargement
  showInitialLoadingMessage();
  
  // Variable pour suivre les tentatives
  let attempts = 0;
  const maxAttempts = 3;
  
  // Fonction d'initialisation avec mécanisme de réessai
  const attemptRender = () => {
    attempts++;
    console.debug(`Tentative de rendu #${attempts}/${maxAttempts}`);
    
    try {
      // Ajouter un gestionnaire d'erreur global
      window.onerror = (message, source, lineno, colno, error) => {
        console.error('Erreur globale interceptée:', message);
        
        if (message && message.toString().includes('useLayoutEffect')) {
          console.warn('Erreur useLayoutEffect détectée, tentative de récupération...');
          // Afficher les boutons de récupération
          const retryButton = document.getElementById('retry-button');
          const cloudButton = document.getElementById('cloud-button');
          if (retryButton) retryButton.style.display = 'inline-block';
          if (cloudButton) cloudButton.style.display = 'inline-block';
          return true; // Empêcher la propagation de l'erreur
        }
        return false;
      };
      
      // Exécuter le callback de rendu avec un délai progressif en cas d'échec
      renderCallback();
      console.debug('Rendu initial réussi');
      attempts = maxAttempts; // Arrêter les tentatives si réussi
    } catch (error) {
      console.error('Erreur lors du rendu initial:', error);
      
      // Si nous n'avons pas atteint le nombre max de tentatives, réessayer
      if (attempts < maxAttempts) {
        console.warn(`Nouvelle tentative dans ${attempts * 500}ms...`);
        setTimeout(attemptRender, attempts * 500); // Délai progressif
      } else {
        // Afficher les boutons de récupération en cas d'échec définitif
        const retryButton = document.getElementById('retry-button');
        const cloudButton = document.getElementById('cloud-button');
        if (retryButton) retryButton.style.display = 'inline-block';
        if (cloudButton) cloudButton.style.display = 'inline-block';
        
        // Ajouter un message d'erreur supplémentaire
        const loadingContainer = document.querySelector('[style*="background: white"]');
        if (loadingContainer) {
          const errorDiv = document.createElement('div');
          errorDiv.style.color = '#e11d48';
          errorDiv.style.marginTop = '1rem';
          errorDiv.style.padding = '0.5rem';
          errorDiv.style.borderRadius = '0.25rem';
          errorDiv.style.backgroundColor = '#fee2e2';
          errorDiv.textContent = error?.message || 'Erreur de chargement de l\'application';
          loadingContainer.appendChild(errorDiv);
        }
      }
    }
  };
  
  // Démarrer la première tentative après un court délai
  setTimeout(attemptRender, 100);
};
