
/**
 * Utilitaires pour la configuration et le déploiement sur Netlify
 * Ce module contient des fonctions pour vérifier et préparer l'environnement Netlify
 */

// Vérifie si l'application s'exécute dans un environnement Netlify
export const isNetlifyEnvironment = (): boolean => {
  return (
    process.env.NETLIFY === 'true' || 
    typeof process.env.NETLIFY_SITE_ID !== 'undefined' ||
    typeof window !== 'undefined' && window.location.hostname.includes('netlify.app')
  );
};

// Configure les redirections pour l'API en fonction de l'environnement
export const getApiEndpoint = (): string => {
  // Si on est dans un environnement Netlify
  if (isNetlifyEnvironment()) {
    // Utiliser l'API externe par défaut pour les déploiements Netlify
    return import.meta.env.VITE_CLOUD_API_URL || 'https://api-inference.huggingface.co';
  }
  
  // Par défaut, utiliser l'API locale en développement
  return import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
};

// Détecte si le navigateur est utilisé depuis un appareil mobile
export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Configuration des variables d'environnement pour Netlify
export const getNetlifyEnvConfig = () => {
  return {
    isNetlify: isNetlifyEnvironment(),
    siteUrl: process.env.URL || '',
    mode: process.env.CONTEXT || 'development',
    buildId: process.env.BUILD_ID || '',
    deployId: process.env.DEPLOY_ID || '',
    isProduction: process.env.CONTEXT === 'production',
  };
};

// Détecte si nous sommes dans un environnement de prévisualisation Netlify
export const isNetlifyPreview = (): boolean => {
  if (typeof process !== 'undefined') {
    return process.env.CONTEXT === 'deploy-preview' || process.env.CONTEXT === 'branch-deploy';
  }
  
  if (typeof window !== 'undefined') {
    return window.location.hostname.includes('--') && window.location.hostname.includes('netlify.app');
  }
  
  return false;
};

// Génère l'URL pour OAuth redirect en fonction de l'environnement
export const getOAuthRedirectUrl = (provider: string): string => {
  const baseUrl = isNetlifyEnvironment() 
    ? window.location.origin 
    : 'http://localhost:8080';
    
  return `${baseUrl}/auth/callback/${provider}`;
};
