
/**
 * Gestionnaire d'état OAuth
 * 
 * Ce module fournit des fonctions pour générer et valider des états OAuth sécurisés
 * afin de protéger contre les attaques CSRF.
 */

import { supabase } from '@/integrations/supabase/client';

// Génère un état sécurisé pour les redirections OAuth
export const generateOAuthState = async (provider: string, redirectPath?: string): Promise<string> => {
  try {
    // Créer un ID aléatoire
    const stateId = Math.random().toString(36).substring(2, 15);
    
    // Ajouter un timestamp pour limiter la durée de validité
    const timestamp = Date.now();
    
    // Créer l'objet d'état
    const stateObj = {
      id: stateId,
      provider,
      timestamp,
      redirectPath: redirectPath || '/'
    };
    
    // Stocker l'état dans le localStorage pour la validation ultérieure
    localStorage.setItem(`oauth_state_${stateId}`, JSON.stringify(stateObj));
    
    // Renvoyer l'ID d'état à utiliser dans l'URL de redirection
    return stateId;
  } catch (error) {
    console.error('Erreur lors de la génération de l\'état OAuth:', error);
    return Math.random().toString(36).substring(2, 15); // Fallback
  }
};

// Valide un état OAuth reçu après redirection
export const validateOAuthState = (stateId: string): { isValid: boolean; redirectPath?: string } => {
  try {
    // Récupérer l'objet d'état du localStorage
    const stateJson = localStorage.getItem(`oauth_state_${stateId}`);
    
    if (!stateJson) {
      return { isValid: false };
    }
    
    const stateObj = JSON.parse(stateJson);
    
    // Vérifier si l'état n'a pas expiré (validité de 10 minutes)
    const now = Date.now();
    const validityPeriod = 10 * 60 * 1000; // 10 minutes en ms
    
    if (now - stateObj.timestamp > validityPeriod) {
      localStorage.removeItem(`oauth_state_${stateId}`);
      return { isValid: false };
    }
    
    // Nettoyer le localStorage
    localStorage.removeItem(`oauth_state_${stateId}`);
    
    // Retourner le chemin de redirection si présent
    return { 
      isValid: true, 
      redirectPath: stateObj.redirectPath 
    };
  } catch (error) {
    console.error('Erreur lors de la validation de l\'état OAuth:', error);
    return { isValid: false };
  }
};

export default {
  generateOAuthState,
  validateOAuthState
};
