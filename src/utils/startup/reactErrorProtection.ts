
/**
 * Protection contre les erreurs React en production
 * 
 * Ce module contient des mécanismes pour détecter et récupérer des erreurs
 * liées à l'instance React en production, notamment les problèmes de createContext.
 */

import { React, getEmergencyReactInstance } from '@/core/ReactInstance';

/**
 * Tente de corriger une erreur React liée à createContext
 * @returns true si la récupération a réussi
 */
export function attemptReactRecovery(): boolean {
  // Vérifier si React existe et fonctionne correctement
  if (!React || !React.createContext) {
    console.error("[ERREUR CRITIQUE] React ou createContext non disponible");
    
    // Tentative de récupération d'une instance React fonctionnelle
    const emergencyReact = getEmergencyReactInstance();
    
    if (emergencyReact && emergencyReact.createContext) {
      console.log("[RÉCUPÉRATION] Instance React alternative trouvée");
      
      // En production, on pourrait tenter de remplacer l'instance problématique
      // C'est une solution de dernier recours et non recommandée en développement
      if (import.meta.env.PROD) {
        try {
          // Patch global pour les cas désespérés en production
          (window as any).__REACT_RECOVERY_INSTANCE = emergencyReact;
          console.warn("[RÉCUPÉRATION] Instance de secours enregistrée comme __REACT_RECOVERY_INSTANCE");
          return true;
        } catch (e) {
          console.error("[RÉCUPÉRATION ÉCHOUÉE] Impossible de définir l'instance de secours:", e);
        }
      }
    }
    
    return false;
  }
  
  return true;
}

/**
 * Vérifie si createContext fonctionne correctement
 * @returns true si createContext fonctionne
 */
export function testCreateContext(): boolean {
  try {
    // Test simple de createContext
    const TestContext = React.createContext<any>(null);
    
    // Si on arrive ici, c'est que createContext fonctionne
    return !!TestContext;
  } catch (e) {
    console.error("[TEST ÉCHOUÉ] createContext a généré une erreur:", e);
    return false;
  }
}

/**
 * Configure des gestionnaires d'erreurs pour détecter les problèmes React
 */
export function setupReactErrorHandlers(): void {
  // Erreur non capturée (erreurs synchrones)
  window.addEventListener('error', (event) => {
    // Détecter les erreurs liées à React
    if (event.message && (
      event.message.includes('createContext') ||
      event.message.includes('Invalid hook call') ||
      event.message.includes('React.createElement') ||
      event.message.includes('Cannot read properties of undefined')
    )) {
      console.error("[ERREUR REACT DÉTECTÉE]", event.message);
      attemptReactRecovery();
    }
  });
  
  // Rejets de promesses non gérés (erreurs asynchrones)
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason);
    
    // Détecter les erreurs liées à React
    if (message && (
      message.includes('createContext') ||
      message.includes('Invalid hook call') ||
      message.includes('React.createElement')
    )) {
      console.error("[ERREUR REACT ASYNCHRONE DÉTECTÉE]", message);
      attemptReactRecovery();
    }
  });
}

// Exécuter la configuration si on est dans un navigateur
if (typeof window !== 'undefined') {
  setupReactErrorHandlers();
  
  // Test préventif de React pour détecter les problèmes au plus tôt
  setTimeout(() => {
    if (!testCreateContext()) {
      console.warn("[INITIALISATION] Problème détecté avec createContext, tentative de récupération...");
      attemptReactRecovery();
    }
  }, 0);
}
