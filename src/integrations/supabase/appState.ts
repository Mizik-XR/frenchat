
/**
 * État global de l'application pour Supabase
 * 
 * Ce fichier centralise l'état lié à Supabase pour éviter les dépendances circulaires
 * et permettre un partage sécurisé entre les composants.
 */

import { initializeAppState } from './sessionManager';

// Configuration Supabase
interface SupabaseError {
  message: string;
  timestamp: Date;
  context?: string;
}

// État de l'application partagé
class AppState {
  // État d'authentification et de connexion
  private _isOfflineMode: boolean = false;
  private _isAuthenticated: boolean = false;
  private _supabaseErrors: SupabaseError[] = [];
  private _localAIAvailable: boolean = false;

  // Propriétés en lecture seule
  get isOfflineMode(): boolean {
    return this._isOfflineMode;
  }

  get isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  get supabaseErrors(): SupabaseError[] {
    return [...this._supabaseErrors];
  }

  get localAIAvailable(): boolean {
    return this._localAIAvailable;
  }

  // Modificateurs d'état
  setOfflineMode(value: boolean): void {
    this._isOfflineMode = value;
    console.log(`Mode hors ligne ${value ? 'activé' : 'désactivé'}`);
  }

  setAuthenticated(value: boolean): void {
    this._isAuthenticated = value;
  }

  setLocalAIAvailable(value: boolean): void {
    this._localAIAvailable = value;
  }

  // Gestion des erreurs
  logSupabaseError(error: Error, context?: string): void {
    const supabaseError: SupabaseError = {
      message: error.message,
      timestamp: new Date(),
      context
    };
    
    this._supabaseErrors.push(supabaseError);
    console.error(`Erreur Supabase ${context ? `(${context})` : ''}: ${error.message}`);
    
    // Limiter le nombre d'erreurs stockées
    if (this._supabaseErrors.length > 50) {
      this._supabaseErrors = this._supabaseErrors.slice(-50);
    }
  }

  clearErrors(): void {
    this._supabaseErrors = [];
  }

  // Détection du service d'IA local
  async detectLocalAIService(): Promise<{ available: boolean; message?: string }> {
    try {
      if (this._isOfflineMode) {
        return { available: false, message: "Mode hors ligne activé" };
      }
      
      // Essayer de contacter le serveur d'IA local
      const response = await fetch('http://localhost:8000/health', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(3000) // Timeout de 3 secondes
      });
      
      if (response.ok) {
        const data = await response.json();
        this._localAIAvailable = true;
        return { available: true, message: data.status || "Service disponible" };
      } else {
        this._localAIAvailable = false;
        return { available: false, message: "Service indisponible" };
      }
    } catch (error) {
      this._localAIAvailable = false;
      const message = error instanceof Error ? error.message : "Erreur inconnue";
      return { available: false, message };
    }
  }
}

// Singleton pour l'état de l'application
export const APP_STATE = new AppState();

// Initialiser la référence dans sessionManager pour éviter la dépendance circulaire
initializeAppState({
  isOfflineMode: APP_STATE.isOfflineMode,
  setOfflineMode: (value) => APP_STATE.setOfflineMode(value),
  logSupabaseError: (error) => APP_STATE.logSupabaseError(error)
});

/**
 * Fonction pour détecter le service d'IA local
 * Exportée pour être facilement utilisable ailleurs
 */
export const detectLocalAIService = async () => {
  return APP_STATE.detectLocalAIService();
};
