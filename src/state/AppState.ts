/**
 * AppState.ts
 * Module centralisé de gestion d'état pour Frenchat avec gestion avancée de la sécurité
 */

import { createContext, useContext, useReducer, useEffect, ReactNode } from '@/core/reactInstance';
import { supabase } from '@/compatibility/supabaseCompat';
import { encryptionService } from '@/services/encryption';

// Types d'état enrichis
export interface AppState {
  security: SecurityState;
  ui: UIState;
  user: UserState;
  system: SystemState;
  documents: DocumentState;
}

interface SecurityState {
  isOffline: boolean;
  encryptionVersion: string;
  lastSecurityCheck: Date | null;
  securityLevel: 'high' | 'medium' | 'low';
  activeTokens: string[];
  pendingOperations: SecureOperation[];
}

interface UIState {
  isDarkMode: boolean;
  isLoading: boolean;
  notifications: Notification[];
  modals: ModalState;
  accessibility: AccessibilitySettings;
}

interface UserState {
  currentUser: UserProfile | null;
  preferences: UserPreferences;
  permissions: UserPermissions;
  lastActivity: Date | null;
  sessionTimeout: number;
}

interface SystemState {
  errorLog: ErrorEntry[];
  performance: PerformanceMetrics;
  networkStatus: NetworkStatus;
  aiModel: AIModelConfig;
}

interface DocumentState {
  currentDocument: Document | null;
  processingQueue: DocumentOperation[];
  syncStatus: SyncStatus;
}

// Types détaillés
export interface UserProfile {
  id: string;
  is_first_login: boolean;
  created_at: string;
  updated_at: string;
  security_level: number;
  allowed_operations: string[];
  max_storage: number;
  current_storage: number;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationPreferences;
  accessibility: AccessibilitySettings;
  aiPreferences: AIPreferences;
}

export interface UserPermissions {
  allowedOperations: Set<string>;
  maxSecurityLevel: number;
  roleId: string;
  restrictions: string[];
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'security';
  timestamp: Date;
  read: boolean;
  priority: 1 | 2 | 3;
  action?: () => void;
  securityRelated?: boolean;
}

export interface ErrorEntry {
  id: string;
  error: Error;
  timestamp: Date;
  context: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
}

// État initial sécurisé
const initialState: AppState = {
  security: {
    isOffline: false,
    encryptionVersion: '1.0',
    lastSecurityCheck: null,
    securityLevel: 'high',
    activeTokens: [],
    pendingOperations: []
  },
  ui: {
    isDarkMode: false,
    isLoading: false,
    notifications: [],
    modals: { active: [] },
    accessibility: { highContrast: false, fontSize: 'medium' }
  },
  user: {
    currentUser: null,
    preferences: {
      theme: 'system',
      language: 'fr',
      notifications: { enabled: true, level: 'all' },
      accessibility: { highContrast: false, fontSize: 'medium' },
      aiPreferences: { model: 'local', useCloud: false }
    },
    permissions: {
      allowedOperations: new Set(),
      maxSecurityLevel: 0,
      roleId: '',
      restrictions: []
    },
    lastActivity: null,
    sessionTimeout: 30 * 60 * 1000 // 30 minutes
  },
  system: {
    errorLog: [],
    performance: { lastCheck: null, metrics: {} },
    networkStatus: { online: true, latency: 0 },
    aiModel: { type: 'local', provider: 'mistral', version: '3.1' }
  },
  documents: {
    currentDocument: null,
    processingQueue: [],
    syncStatus: { lastSync: null, pending: [] }
  }
};

// Types d'actions typés
type Action = 
  | SecurityAction
  | UIAction
  | UserAction
  | SystemAction
  | DocumentAction;

// Réducteur sécurisé avec validation
const appReducer = (state: AppState, action: Action): AppState => {
  try {
    // Validation de sécurité avant chaque action
    validateActionSecurity(action, state);
    
    const newState = handleAction(state, action);
    
    // Validation de l'état après modification
    validateStateIntegrity(newState);
    
    // Journalisation sécurisée
    logStateChange(state, newState, action);
    
    return newState;
  } catch (error) {
    // Gestion sécurisée des erreurs
    handleStateError(error, state);
    return state;
  }
};

// Provider sécurisé avec monitoring
export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Monitoring de sécurité
  useEffect(() => {
    const securityMonitor = setInterval(() => {
      performSecurityCheck(state);
    }, 60000);
    
    return () => clearInterval(securityMonitor);
  }, [state]);
  
  // Gestion des sessions
  useEffect(() => {
    const sessionManager = new SessionManager(state, dispatch);
    return () => sessionManager.cleanup();
  }, [state.user.currentUser]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};

// Hook sécurisé
export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new SecurityError('useAppState doit être utilisé à l\'intérieur d\'un AppStateProvider');
  }
  
  // Vérification de sécurité à chaque utilisation
  validateStateAccess(context.state);
  
  return context;
};

// Actions sécurisées
export const AppStateActions = {
  security: {
    setOfflineMode: (offline: boolean) => 
      createSecureAction('SET_OFFLINE_MODE', { offline }),
    updateSecurityLevel: (level: SecurityState['securityLevel']) =>
      createSecureAction('UPDATE_SECURITY_LEVEL', { level }),
    revokeToken: (token: string) =>
      createSecureAction('REVOKE_TOKEN', { token })
  },
  user: {
    setCurrentUser: (user: UserProfile | null) =>
      createSecureAction('SET_CURRENT_USER', { user }),
    updatePreferences: (preferences: Partial<UserPreferences>) =>
      createSecureAction('UPDATE_PREFERENCES', { preferences }),
    updatePermissions: (permissions: Partial<UserPermissions>) =>
      createSecureAction('UPDATE_PERMISSIONS', { permissions })
  },
  // ... autres actions
};

// Utilitaires de sécurité
const validateActionSecurity = (action: Action, state: AppState) => {
  // Vérification des permissions
  if (!hasPermissionForAction(action, state)) {
    throw new SecurityError(`Action non autorisée: ${action.type}`);
  }
  
  // Validation des données
  validateActionPayload(action);
  
  // Vérification de l'état de la session
  validateSessionState(state);
};

const validateStateIntegrity = (state: AppState) => {
  // Vérification de la cohérence des données
  validateDataIntegrity(state);
  
  // Vérification des invariants de sécurité
  validateSecurityInvariants(state);
  
  // Vérification des limites et quotas
  validateResourceLimits(state);
};

// Gestionnaire de session sécurisé
class SessionManager {
  private readonly state: AppState;
  private readonly dispatch: React.Dispatch<Action>;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(state: AppState, dispatch: React.Dispatch<Action>) {
    this.state = state;
    this.dispatch = dispatch;
    this.initializeSession();
  }

  private initializeSession() {
    this.resetTimeout();
    this.monitorActivity();
    this.syncWithServer();
  }

  private resetTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    
    this.timeoutId = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.state.user.sessionTimeout);
  }

  cleanup() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}

// Initialisation sécurisée
export const initializeAppState = async (): Promise<Partial<AppState>> => {
  try {
    // Vérification de l'environnement
    validateEnvironment();
    
    // Récupération des préférences système
    const systemPreferences = await getSecureSystemPreferences();
    
    // Vérification de l'état de connexion
    const networkStatus = await checkSecureNetworkStatus();
    
    // Initialisation du modèle IA
    const aiConfig = await initializeSecureAIModel();
    
    return {
      security: {
        isOffline: !networkStatus.online,
        encryptionVersion: await encryptionService.getCurrentVersion(),
        lastSecurityCheck: new Date(),
        securityLevel: 'high'
      },
      ui: {
        isDarkMode: systemPreferences.darkMode,
        accessibility: systemPreferences.accessibility
      },
      system: {
        networkStatus,
        aiModel: aiConfig
      }
    };
  } catch (error) {
    handleInitializationError(error);
    return initialState;
  }
}; 