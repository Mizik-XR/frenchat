import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.warn("VITE_SUPABASE_URL is not set. Supabase might not work correctly.");
}

if (!supabaseAnonKey) {
  console.warn("VITE_SUPABASE_ANON_KEY is not set. Supabase might not work correctly.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// État global de l'application
export const APP_STATE = {
  isOfflineMode: false,
  isCloudMode: window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true',
  isDevMode: import.meta.env.DEV,
  isLocalAIAvailable: false,
  isSupabaseAvailable: true,
  userAgent: navigator.userAgent,
  platformInfo: {
    os: detectOS(),
    browser: detectBrowser(),
    version: detectBrowserVersion(),
  },
  config: {
    allowAnonymousUsers: true,
    requireLogin: false,
    disableLocalStorage: false,
    enforceStrictMode: false,
  }
};

// Fonction pour précharger la session utilisateur
export const preloadSession = async () => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error) {
    console.error("Erreur lors du préchargement de la session:", error);
    return null;
  }
};

// Utilitaire pour gérer les requêtes de profil
export const handleProfileQuery = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return null;
  }
};

// Utilitaire pour vérifier la connexion Supabase
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('settings').select('key').limit(1);
    return !error;
  } catch (error) {
    console.error("Erreur de connexion à Supabase:", error);
    return false;
  }
};

// Fonction pour détecter le système d'exploitation
function detectOS() {
  const userAgent = window.navigator.userAgent;
  if (userAgent.indexOf("Windows") !== -1) return "Windows";
  if (userAgent.indexOf("Mac") !== -1) return "macOS";
  if (userAgent.indexOf("Linux") !== -1) return "Linux";
  if (userAgent.indexOf("Android") !== -1) return "Android";
  if (userAgent.indexOf("iOS") !== -1) return "iOS";
  return "Unknown";
}

// Fonction pour détecter le navigateur
function detectBrowser() {
  const userAgent = window.navigator.userAgent;
  if (userAgent.indexOf("Chrome") !== -1) return "Chrome";
  if (userAgent.indexOf("Firefox") !== -1) return "Firefox";
  if (userAgent.indexOf("Safari") !== -1) return "Safari";
  if (userAgent.indexOf("Edge") !== -1) return "Edge";
  if (userAgent.indexOf("Opera") !== -1 || userAgent.indexOf("OPR") !== -1) return "Opera";
  return "Unknown";
}

// Fonction pour détecter la version du navigateur
function detectBrowserVersion() {
  const userAgent = window.navigator.userAgent;
  const match = userAgent.match(/(chrome|firefox|safari|edge|opr|opera(?=\/))\/?\s*(\d+)/i);
  return match ? match[2] : "Unknown";
}

// Type pour les réponses des Edge Functions
export interface EdgeFunctionResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

export const updateCachedUser = (user: any) => {
  // Mettre à jour l'utilisateur en cache
};

export const updateSessionLoading = (isLoading: boolean) => {
  // Mettre à jour l'état de chargement de la session
};
