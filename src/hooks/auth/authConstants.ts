
import { User } from "@supabase/supabase-js";

// Cache global pour l'utilisateur connecté
// Permet d'éviter des vérifications redondantes et de partager l'état entre les composants
let cachedUser: User | null = null;

// État de chargement global partagé entre les composants
let isSessionLoading: boolean = true;

// Mettre à jour le cache de l'utilisateur
const updateCachedUser = (user: User | null) => {
  cachedUser = user;
};

// Mettre à jour l'état de chargement global
const updateSessionLoading = (loading: boolean) => {
  isSessionLoading = loading;
};

// Routes protégées qui nécessitent une authentification
const PROTECTED_ROUTES = [
  '/chat',
  '/documents',
  '/config',
  '/home',
  '/advanced-config',
  '/ai-config',
  '/monitoring',
  '/rag-advanced-settings'
];

export {
  cachedUser,
  isSessionLoading,
  updateCachedUser,
  updateSessionLoading,
  PROTECTED_ROUTES
};
