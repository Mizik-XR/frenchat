
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Les variables d\'environnement Supabase ne sont pas configurées :');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Défini' : 'Non défini');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Défini' : 'Non défini');
}

// URL à utiliser pour les redirections d'authentification (en local)
export const SITE_URL = 'http://localhost:8080';

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
      detectSessionInUrl: true
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
