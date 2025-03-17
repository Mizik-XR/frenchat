
/**
 * Utilitaires pour l'état et le chargement de l'application
 */

import { detectLocalAIService, APP_STATE } from '@/compatibility/supabaseCompat';
import { toast } from '@/hooks/use-toast';

/**
 * Vérifie l'état de santé de l'application et ses services critiques
 */
export const checkApplicationHealth = async () => {
  const results = {
    localAI: false,
    supabase: false,
    internetConnection: false
  };

  // Vérifier la connexion Internet
  try {
    const online = navigator.onLine;
    if (online) {
      // Double-vérification avec une requête fetch
      const response = await fetch('https://www.google.com/favicon.ico', { 
        mode: 'no-cors',
        cache: 'no-store'
      });
      results.internetConnection = true;
    }
  } catch (e) {
    console.error("Erreur lors de la vérification de la connexion Internet:", e);
  }

  // Vérifier le service d'IA local
  try {
    const localAICheck = await detectLocalAIService();
    results.localAI = localAICheck.available;
  } catch (e) {
    console.error("Erreur lors de la vérification du service d'IA local:", e);
  }

  // Vérifier la connexion à Supabase
  try {
    const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;
    if (VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY) {
      results.supabase = true;
    }
  } catch (e) {
    console.error("Erreur lors de la vérification de la connexion Supabase:", e);
  }

  return results;
};

/**
 * Vérifie si une route existe dans l'application
 */
export const validateRoute = (route: string): boolean => {
  const validRoutes = [
    '/', '/index', '/auth', '/home', '/chat', '/config', 
    '/documents', '/monitoring', '/ai-config'
  ];
  
  return validRoutes.includes(route) || 
         route.startsWith('/auth/') || 
         route.startsWith('/chat/');
};

/**
 * Redémarre l'application
 */
export const restartApplication = () => {
  // Afficher un toast de notification
  toast({
    title: "Redémarrage de l'application",
    description: "L'application va être rechargée dans quelques secondes..."
  });
  
  // Nettoyer certains caches si nécessaire
  localStorage.removeItem('aiServiceType');
  
  // Redirection vers la page d'accueil après un court délai
  setTimeout(() => {
    window.location.href = '/';
  }, 2000);
};
