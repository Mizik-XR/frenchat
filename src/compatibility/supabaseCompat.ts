
/**
 * MODULE DE COMPATIBILITÉ GLOBAL
 * 
 * Ce fichier sert de point d'entrée unique pour toutes les fonctionnalités
 * qui étaient auparavant importées de multiples sources, créant des dépendances circulaires.
 * 
 * IMPORTANT: Ce module est une solution temporaire pour stabiliser l'application.
 * Une refactorisation plus propre devra être envisagée ultérieurement.
 */

import { isLovableEnvironment, isPreviewEnvironment } from '@/utils/environment';

// État de l'application partagé avec accès mutables pour compatibilité
class CompatAppState {
  private _isOfflineMode: boolean = false;
  private _supabaseErrors: Array<{message: string, timestamp: Date, context?: string}> = [];
  private _lastError: Error | null = null;
  private _localAIAvailable: boolean = false;

  // Propriétés
  get isOfflineMode(): boolean {
    return this._isOfflineMode || isLovableEnvironment();
  }

  set isOfflineMode(value: boolean) {
    console.warn('[Compat] Setting isOfflineMode directly via APP_STATE (deprecated)');
    this._isOfflineMode = value;
  }

  get supabaseErrors(): Array<{message: string, timestamp: Date, context?: string}> {
    return [...this._supabaseErrors];
  }

  get lastError(): Error | null {
    return this._lastError;
  }

  get localAIAvailable(): boolean {
    // Dans l'environnement Lovable, considérer que les services locaux ne sont jamais disponibles
    if (isLovableEnvironment()) return false;
    return this._localAIAvailable;
  }

  get hasSupabaseError(): boolean {
    return this._supabaseErrors.length > 0;
  }

  // Méthodes
  setOfflineMode(value: boolean): void {
    this._isOfflineMode = value;
    console.log(`[Compat] Mode hors ligne ${value ? 'activé' : 'désactivé'}`);
    // Propager le changement aux composants qui écoutent via localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('OFFLINE_MODE', value ? 'true' : 'false');
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'OFFLINE_MODE',
        newValue: value ? 'true' : 'false'
      }));
    }
  }

  logSupabaseError(error: Error, context?: string): void {
    console.error(`[Compat] Erreur Supabase ${context ? `(${context})` : ''}: ${error.message}`);
    this._lastError = error;
    this._supabaseErrors.push({
      message: error.message,
      timestamp: new Date(),
      context
    });
    
    // Limiter le nombre d'erreurs stockées
    if (this._supabaseErrors.length > 50) {
      this._supabaseErrors = this._supabaseErrors.slice(-50);
    }
  }

  clearErrors(): void {
    this._supabaseErrors = [];
    this._lastError = null;
  }

  setLocalAIAvailable(value: boolean): void {
    this._localAIAvailable = value;
  }

  // Cette fonction est nécessaire pour éviter les erreurs de compilation
  detectLocalAIService = async (): Promise<{ available: boolean; message?: string }> => {
    console.warn('[Compat] Using detectLocalAIService from compatibility module');
    
    try {
      // Si on est dans l'environnement Lovable, ne pas tenter de détecter les services locaux
      if (isLovableEnvironment() || isPreviewEnvironment()) {
        console.log("[Compat] Environnement de prévisualisation détecté, ignorant la détection de service local");
        return { available: false, message: "Environnement de prévisualisation" };
      }
      
      if (this._isOfflineMode) {
        return { available: false, message: "Mode hors ligne activé" };
      }
      
      // Simuler une tentative de connexion à un service local
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch('http://localhost:8000/health', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          this.setLocalAIAvailable(true);
          return { available: true, message: data.status || "Service disponible" };
        } else {
          this.setLocalAIAvailable(false);
          return { available: false, message: "Service indisponible" };
        }
      } catch (error) {
        this.setLocalAIAvailable(false);
        return { available: false, message: error instanceof Error ? error.message : "Erreur inconnue" };
      }
    } catch (error) {
      console.error('[Compat] Erreur lors de la détection du service IA local:', error);
      return { available: false, message: "Erreur lors de la vérification" };
    }
  }
}

// Instance unique exportée
export const APP_STATE = new CompatAppState();

// Fonctions de compatibilité
export const checkOfflineMode = () => {
  console.warn('[Compat] Using checkOfflineMode from compatibility module');
  
  // Si on est dans l'environnement Lovable, forcer le mode hors ligne
  if (isLovableEnvironment()) {
    localStorage.setItem('FORCE_CLOUD_MODE', 'true');
    localStorage.setItem('aiServiceType', 'cloud');
    return true;
  }
  
  // Vérifier si nous sommes dans un navigateur
  if (typeof window !== 'undefined') {
    // Vérifier si le mode hors ligne est activé dans localStorage
    const storedOfflineMode = localStorage.getItem('OFFLINE_MODE');
    if (storedOfflineMode === 'true') {
      APP_STATE.setOfflineMode(true);
    }
    
    // Vérifier l'état de la connexion
    if (!navigator.onLine) {
      console.log('[Compat] Pas de connexion réseau, activation du mode hors ligne');
      APP_STATE.setOfflineMode(true);
    }
  }
  
  return APP_STATE.isOfflineMode;
};

export const detectLocalAIService = async (): Promise<{ available: boolean; message?: string }> => {
  // Dans l'environnement Lovable, ne pas tenter de détecter les services locaux
  if (isLovableEnvironment() || isPreviewEnvironment()) {
    console.log("[Compat] Environnement de prévisualisation détecté, ignorant la détection de service local");
    return { available: false, message: "Environnement de prévisualisation" };
  }
  
  return APP_STATE.detectLocalAIService();
};

// Helpers pour le module de compatibilité
export const logCompat = (functionName: string) => {
  console.log(`[Compat] ${functionName} appelée depuis le module de compatibilité`);
};

// Export de fonctions et constantes pour éviter les dépendances circulaires
export const preloadSession = async () => {
  console.warn('[Compat] Using preloadSession from compatibility module');
  
  if (APP_STATE.isOfflineMode) {
    console.log("[Compat] Application en mode hors ligne, préchargement de session ignoré.");
    return { session: null };
  }
  
  try {
    console.log("[Compat] Tentative de préchargement de la session...");
    
    // Cette implémentation est juste un stub
    // Dans un vrai cas d'utilisation, nous importerions la vraie fonction d'un autre module
    return { session: null, error: null };
  } catch (error) {
    console.error("[Compat] Erreur de préchargement de session:", error);
    
    // Si c'est une erreur réseau, activer le mode hors ligne
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

// Fonctions de diagnostic pour vérifier la santé du système
export const checkApplicationHealth = async () => {
  console.warn('[Compat] Using checkApplicationHealth from compatibility module');
  
  return {
    localAI: APP_STATE.localAIAvailable,
    supabase: !APP_STATE.isOfflineMode,
    internetConnection: typeof navigator !== 'undefined' ? navigator.onLine : true
  };
};
