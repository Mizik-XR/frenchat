
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Les variables d\'environnement Supabase ne sont pas configurées :');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Défini' : 'Non défini');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Défini' : 'Non défini');
}

// Détecter si nous sommes dans l'environnement de prévisualisation
const isPreviewEnvironment = window.location.hostname.includes('preview') || 
                            window.location.hostname.includes('lovable') || 
                            !window.location.hostname.includes('localhost');

// URL à utiliser pour les redirections d'authentification
const siteUrl = isPreviewEnvironment 
  ? window.location.origin 
  : 'http://localhost:8080';

console.log('URL du site détectée pour l\'authentification:', siteUrl);

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      storageKey: 'filechat-storage-key',
      autoRefreshToken: true,
      debug: true,
      flowType: 'pkce',
      detectSessionInUrl: true,
      // Utiliser la bonne URL pour les redirections
      site: siteUrl
    },
  }
)

// Pour le débogage - écouter les changements d'authentification
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Changement d\'état d\'authentification :', event, session ? 'Session valide' : 'Pas de session');
});

// Vérifier la connexion
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('Erreur lors de la récupération de la session :', error);
  } else {
    console.log('Statut de connexion Supabase :', data.session ? 'Connecté' : 'Non connecté');
  }
});

// Exporter l'URL du site pour réutilisation
export const SITE_URL = siteUrl;
