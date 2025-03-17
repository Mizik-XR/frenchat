
// Gestionnaire de session Supabase optimisé pour éviter les dépendances circulaires
import { supabase } from './client';
import { APP_STATE } from '@/compatibility/supabaseCompat';

// Type simple pour l'état de l'application (évite l'import circulaire de appState)
interface AppStateInterface {
  isOfflineMode: boolean;
  setOfflineMode: (value: boolean) => void;
  logSupabaseError: (error: Error) => void;
}

// Utilisation du module de compatibilité comme état de l'application
export const initializeAppState = (appState: AppStateInterface) => {
  console.log("initializeAppState appelé mais ignoré - utilisation du module de compatibilité");
  // Pas besoin d'initialiser APP_STATE car nous utilisons la version du module de compatibilité
};

// Préchargement de la session Supabase
export const preloadSession = async () => {
  if (APP_STATE.isOfflineMode) {
    console.log("Application en mode hors ligne, préchargement de session ignoré.");
    return { session: null };
  }
  
  try {
    console.log("Tentative de préchargement de la session Supabase...");
    console.log("URL Supabase:", import.meta.env.VITE_SUPABASE_URL);
    console.log("Clé Supabase définie:", !!import.meta.env.VITE_SUPABASE_ANON_KEY);
    
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      const error = new Error("Configuration Supabase incomplète");
      APP_STATE.logSupabaseError(error);
      throw error;
    }
    
    // Vérifier d'abord si le client est défini
    if (!supabase) {
      const error = new Error("Client Supabase non initialisé");
      APP_STATE.logSupabaseError(error);
      throw error;
    }
    
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      APP_STATE.logSupabaseError(error);
      throw error;
    }
    
    console.log("Session Supabase préchargée avec succès:", data.session ? "Session active" : "Pas de session");
    return data;
  } catch (error) {
    console.error("Erreur de préchargement de session Supabase:", error);
    if (error instanceof Error) {
      APP_STATE.logSupabaseError(error);
    }
    
    // Activer le mode hors ligne si nous rencontrons des erreurs de connexion
    if (error instanceof Error && (
      error.message.includes('Failed to fetch') || 
      error.message.includes('NetworkError') || 
      error.message.includes('Network request failed')
    )) {
      APP_STATE.setOfflineMode(true);
    }
    
    throw error;
  }
};
