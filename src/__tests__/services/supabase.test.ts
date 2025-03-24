/**
 * Tests pour vérifier l'intégration Supabase
 */
import { supabaseService, supabase } from '@/services/supabase/client';
import { APP_STATE, supabaseCompat, checkOfflineMode } from '@/compatibility/supabaseCompat';

// Déclaration de type pour les tests Jest
declare const describe: (name: string, fn: () => void) => void;
declare const test: (name: string, fn: () => void | Promise<void>) => void;
declare const expect: any;
declare const beforeEach: (fn: () => void | Promise<void>) => void;
declare const jest: any;

// Mock de la classe localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Intégration Supabase', () => {
  beforeEach(() => {
    // Réinitialiser le localStorage
    window.localStorage.clear();
    
    // Initialiser le mode hors ligne à false
    APP_STATE.setOfflineMode(false);
    
    // Mock des appels réseau pour Supabase
    jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: null },
      error: null
    });
  });
  
  test("Le service Supabase et le client direct sont identiques", () => {
    expect(supabaseService.getClient()).toBe(supabase);
  });
  
  test("Le mode hors ligne peut être modifié", () => {
    // Le mode hors ligne devrait être false par défaut
    expect(supabaseService.connectivity.isOfflineMode).toBe(false);
    
    // Activer le mode hors ligne
    supabaseService.connectivity.setOfflineMode(true);
    
    // Vérifier que le mode hors ligne est activé
    expect(supabaseService.connectivity.isOfflineMode).toBe(true);
    
    // Vérifier que localStorage est mis à jour
    expect(window.localStorage.getItem('OFFLINE_MODE')).toBe('true');
    
    // Désactiver le mode hors ligne
    supabaseService.connectivity.setOfflineMode(false);
    
    // Vérifier que le mode hors ligne est désactivé
    expect(supabaseService.connectivity.isOfflineMode).toBe(false);
    expect(window.localStorage.getItem('OFFLINE_MODE')).toBe('false');
  });
  
  test("Le client de compatibilité ajoute correctement les méthodes", () => {
    // Vérifier que le client de compatibilité est une extension du client Supabase
    expect(supabaseCompat.auth).toBeDefined();
    
    // Utiliser any pour éviter les erreurs de type sur les propriétés
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anySupabaseCompat = supabaseCompat as any;
    expect(typeof anySupabaseCompat.from).toBe('function');
    
    // Vérifier que les méthodes de compatibilité sont ajoutées
    expect(supabaseCompat.compat).toBeDefined();
    expect(typeof supabaseCompat.compat.auth.user).toBe('function');
    expect(typeof supabaseCompat.compat.auth.session).toBe('function');
    expect(typeof supabaseCompat.compat.from).toBe('function');
  });
  
  test("La fonction checkOfflineMode détecte le mode hors ligne", () => {
    // Simuler le localStorage avec mode hors ligne activé
    window.localStorage.setItem('OFFLINE_MODE', 'true');
    
    // Appeler la fonction de vérification
    const isOffline = checkOfflineMode();
    
    // Vérifier que le mode hors ligne est détecté
    expect(isOffline).toBe(true);
    expect(APP_STATE.isOfflineMode).toBe(true);
  });
  
  test("L'état de l'application (APP_STATE) est correctement initialisé", () => {
    // Vérifier les propriétés d'APP_STATE
    expect(APP_STATE.isOfflineMode).toBeDefined();
    expect(typeof APP_STATE.setOfflineMode).toBe('function');
    expect(typeof APP_STATE.logSupabaseError).toBe('function');
    expect(typeof APP_STATE.getErrorLog).toBe('function');
    expect(typeof APP_STATE.clearErrorLog).toBe('function');
    
    // Vérifier la journalisation des erreurs
    const testError = new Error('Test error');
    APP_STATE.logSupabaseError(testError);
    
    // Vérifier que l'erreur est journalisée
    const errorLog = APP_STATE.getErrorLog();
    expect(errorLog.length).toBe(1);
    expect(errorLog[0]).toBe(testError);
    
    // Effacer le journal d'erreurs
    APP_STATE.clearErrorLog();
    expect(APP_STATE.getErrorLog().length).toBe(0);
  });
}); 