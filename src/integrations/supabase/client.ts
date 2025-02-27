
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// En environnement de développement, utilisez des valeurs par défaut si non définies
const isDevelopment = process.env.NODE_ENV === 'development' || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';

// Avertissement pour les variables manquantes sans bloquer l'app
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Les variables d\'environnement Supabase ne sont pas configurées :');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Défini' : 'Non défini');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Défini' : 'Non défini');
  
  if (!isDevelopment) {
    // En production, c'est une erreur critique
    console.error('En environnement de production, ces variables sont requises');
  } else {
    console.warn('En développement, l\'application continuera avec des fonctionnalités limitées');
  }
}

// URL à utiliser pour les redirections d'authentification (en local)
export const SITE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:8080' 
  : window.location.origin;

// Créer le client Supabase même avec des valeurs potentiellement vides en dev
export const supabase = createClient(
  supabaseUrl || '', // Valeur vide en fallback pour éviter les erreurs
  supabaseAnonKey || '', // Valeur vide en fallback pour éviter les erreurs
  {
    auth: {
      persistSession: true,
      storageKey: 'filechat-storage-key',
      autoRefreshToken: true,
      debug: isDevelopment,
      flowType: 'pkce',
      detectSessionInUrl: true
    },
  }
)

// Pour le débogage - écouter les changements d'authentification
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Changement d\'état d\'authentification :', event, session ? 'Session valide' : 'Pas de session');
});

// Vérifier la connexion sans bloquer
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Erreur lors de la récupération de la session :', error);
  } else {
    console.log('Statut de connexion Supabase :', data.session ? 'Connecté' : 'Non connecté');
  }
}).catch(err => {
  console.error('Erreur non gérée avec Supabase:', err);
});
