/**
 * État d'Application Centralisé
 * 
 * Ce module gère l'état global de l'application en utilisant le pattern singleton
 * tout en évitant les dépendances circulaires avec d'autres modules.
 */

import { supabaseService } from '@/services/supabase/supabaseService';
import { writable, derived, get } from 'svelte/store';

// Types d'états de l'application
export interface AppState {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isOfflineMode: boolean;
  currentUser: any | null;
  currentSession: any | null;
  currentProfile: any | null;
  isDarkMode: boolean;
  notifications: Notification[];
  isMenuOpen: boolean;
  selectedDocumentId: string | null;
  selectedConversationId: string | null;
}

// Type pour les notifications
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timeout?: number;
  createdAt: Date;
}

// État initial
const initialState: AppState = {
  isAuthenticated: false,
  isInitialized: false,
  isOfflineMode: false,
  currentUser: null,
  currentSession: null,
  currentProfile: null,
  isDarkMode: false,
  notifications: [],
  isMenuOpen: false,
  selectedDocumentId: null,
  selectedConversationId: null
};

// Créer le store principal
const state = writable<AppState>(initialState);

// Fonction pour mettre à jour une partie du state
function updateState(partialState: Partial<AppState>) {
  state.update(currentState => ({
    ...currentState,
    ...partialState
  }));
}

// Initialiser l'état de l'application
async function initialize() {
  try {
    // Vérifier la connectivité
    const isConnected = await supabaseService.connectivity.checkConnection();
    updateState({ isOfflineMode: !isConnected });

    // Récupérer le thème de localStorage
    if (typeof window !== 'undefined') {
      const darkMode = localStorage.getItem('DARK_MODE') === 'true';
      updateState({ isDarkMode: darkMode });
    }

    // Charger la session utilisateur si disponible
    const { data } = await supabaseService.auth.getSession();
    if (data && data.session) {
      const { user } = await supabaseService.auth.getUser();
      
      // Mettre à jour l'état avec les informations de session
      updateState({
        isAuthenticated: true,
        currentUser: user,
        currentSession: data.session
      });

      // Récupérer le profil utilisateur
      if (user) {
        const { data: profileData } = await supabaseService.profiles.getProfile(user.id);
        if (profileData) {
          updateState({ currentProfile: profileData });
        }
      }
    }

    // Configurer l'écoute des changements d'authentification
    supabaseService.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { user } = await supabaseService.auth.getUser();
        updateState({
          isAuthenticated: true,
          currentUser: user,
          currentSession: session
        });

        // Récupérer le profil utilisateur
        if (user) {
          const { data: profileData } = await supabaseService.profiles.getProfile(user.id);
          if (profileData) {
            updateState({ currentProfile: profileData });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        updateState({
          isAuthenticated: false,
          currentUser: null,
          currentSession: null,
          currentProfile: null
        });
      }
    });

    // Écouter les changements de connectivité
    if (typeof window !== 'undefined') {
      window.addEventListener('connectivity-change', (event: any) => {
        updateState({ 
          isOfflineMode: event.detail.isOfflineMode 
        });
      });

      // Écouter les changements de thème
      window.addEventListener('theme-change', (event: any) => {
        updateState({ 
          isDarkMode: event.detail.isDarkMode 
        });
      });
    }

    // Initialisation terminée
    updateState({ isInitialized: true });
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de l\'état de l\'application:', error);
    // En cas d'erreur, considérer l'application comme initialisée mais hors ligne
    updateState({ 
      isInitialized: true,
      isOfflineMode: true
    });
  }
}

// API publique pour gérer les notifications
function addNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
  const newNotification: Notification = {
    id: Date.now().toString(),
    createdAt: new Date(),
    ...notification
  };

  state.update(currentState => ({
    ...currentState,
    notifications: [...currentState.notifications, newNotification]
  }));

  // Supprimer automatiquement la notification après le délai spécifié
  if (notification.timeout) {
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, notification.timeout);
  }

  return newNotification.id;
}

function removeNotification(id: string) {
  state.update(currentState => ({
    ...currentState,
    notifications: currentState.notifications.filter(n => n.id !== id)
  }));
}

// Dérivations du store pour des sélecteurs spécifiques
const isAuthenticated = derived(state, $state => $state.isAuthenticated);
const isInitialized = derived(state, $state => $state.isInitialized);
const isOfflineMode = derived(state, $state => $state.isOfflineMode);
const currentUser = derived(state, $state => $state.currentUser);
const currentProfile = derived(state, $state => $state.currentProfile);
const isDarkMode = derived(state, $state => $state.isDarkMode);
const notifications = derived(state, $state => $state.notifications);

// Exporter l'API publique
export const APP_STATE = {
  // Accès au store complet
  subscribe: state.subscribe,
  
  // Obtenir une copie de l'état actuel
  get: () => get(state),
  
  // Sélecteurs dérivés
  isAuthenticated,
  isInitialized,
  isOfflineMode,
  currentUser,
  currentProfile,
  isDarkMode,
  notifications,
  
  // Actions
  initialize,
  
  // Actions pour l'authentification
  login: async (email: string, password: string) => {
    try {
      const { data, error } = await supabaseService.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: `Erreur de connexion: ${error.message}`,
        timeout: 5000
      });
      return { success: false, error };
    }
  },
  
  logout: async () => {
    try {
      await supabaseService.auth.signOut();
      return { success: true };
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: `Erreur de déconnexion: ${error.message}`,
        timeout: 5000
      });
      return { success: false, error };
    }
  },
  
  // Actions pour le profil utilisateur
  updateProfile: async (profileData: any) => {
    const { currentUser } = get(state);
    if (!currentUser) {
      return { success: false, error: new Error('Utilisateur non connecté') };
    }
    
    try {
      const { data, error } = await supabaseService.profiles.updateProfile(
        currentUser.id, 
        profileData
      );
      
      if (error) throw error;
      
      // Mettre à jour le profil dans l'état
      updateState({ 
        currentProfile: { ...get(state).currentProfile, ...profileData } 
      });
      
      return { success: true, data };
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: `Erreur de mise à jour du profil: ${error.message}`,
        timeout: 5000
      });
      return { success: false, error };
    }
  },
  
  // Actions pour les préférences
  setDarkMode: (isDark: boolean) => {
    updateState({ isDarkMode: isDark });
    if (typeof window !== 'undefined') {
      localStorage.setItem('DARK_MODE', isDark.toString());
      window.dispatchEvent(new CustomEvent('theme-change', { 
        detail: { isDarkMode: isDark } 
      }));
    }
  },
  
  // Actions pour gérer le mode hors ligne
  setOfflineMode: (isOffline: boolean) => {
    supabaseService.connectivity.setOfflineMode(isOffline);
  },
  
  // Actions pour la navigation
  setSelectedDocument: (id: string | null) => {
    updateState({ selectedDocumentId: id });
  },
  
  setSelectedConversation: (id: string | null) => {
    updateState({ selectedConversationId: id });
  },
  
  toggleMenu: () => {
    state.update(s => ({ ...s, isMenuOpen: !s.isMenuOpen }));
  },
  
  // Gestion des notifications
  addNotification,
  removeNotification,
  clearNotifications: () => {
    state.update(s => ({ ...s, notifications: [] }));
  },
};

// Exporter également le type pour la sécurité
export type AppStateType = typeof APP_STATE; 