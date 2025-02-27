
// Script de débogage pour l'authentification
console.log('Début du débogage de l'authentification');

// Vérifie si Supabase est configuré
const checkSupabaseConfig = () => {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('SUPABASE_URL configuré:', !!SUPABASE_URL);
  console.log('SUPABASE_ANON_KEY configuré:', !!SUPABASE_ANON_KEY);
  
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
};

// Vérifie les erreurs Firebase
const checkFirebaseErrors = () => {
  const errorsFound = [];
  
  // Vérifier les erreurs dans la console liées à Firebase
  console.log('Recherche des erreurs Firebase...');
  
  // Vérifier si Firebase est correctement initialisé
  if (typeof firebase !== 'undefined') {
    console.log('Firebase est défini dans la portée globale');
  } else {
    errorsFound.push('Firebase n\'est pas défini dans la portée globale');
  }
  
  return errorsFound;
};

// Exécuter les vérifications
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM chargé, exécution des vérifications...');
  
  const supabaseConfigured = checkSupabaseConfig();
  console.log('Supabase configuré correctement:', supabaseConfigured);
  
  const firebaseErrors = checkFirebaseErrors();
  console.log('Erreurs Firebase trouvées:', firebaseErrors.length > 0 ? firebaseErrors : 'Aucune');
  
  // Vérifier l'état de l'authentification
  if (typeof supabase !== 'undefined') {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Erreur lors de la récupération de la session:', error);
      } else {
        console.log('Session récupérée avec succès:', data.session ? 'Utilisateur connecté' : 'Aucun utilisateur connecté');
      }
    });
  } else {
    console.error('Supabase n\'est pas défini, impossible de vérifier l\'état de l\'authentification');
  }
});

// Log des erreurs réseau
const originalFetch = window.fetch;
window.fetch = function(input, init) {
  const url = typeof input === 'string' ? input : input.url;
  console.log(`Fetch: ${url}`);
  
  return originalFetch(input, init)
    .then(response => {
      if (!response.ok) {
        console.warn(`Erreur réseau: ${response.status} pour ${url}`);
      }
      return response;
    })
    .catch(error => {
      console.error(`Erreur fetch pour ${url}:`, error);
      throw error;
    });
};

console.log('Fin du débogage initial de l\'authentification');
