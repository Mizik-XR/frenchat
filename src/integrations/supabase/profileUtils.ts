
import { supabase } from './client';
import { APP_STATE } from './appState';

// Fonction pour gérer les requêtes de profil utilisateur
export const handleProfileQuery = async (userId: string) => {
  // Si on est en mode hors ligne, fournir un profil par défaut
  if (APP_STATE.isOfflineMode || !supabase) {
    console.log("Mode hors ligne actif, utilisation d'un profil par défaut");
    return { 
      data: { 
        id: userId,
        is_first_login: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, 
      error: null 
    };
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      if (error.message?.includes('infinite recursion')) {
        console.warn("Database policy recursion detected. Using fallback profile.");
        
        // Si nous détectons une récursion infinie, créons un profil minimal
        try {
          // Tenter de créer le profil manuellement
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ 
              id: userId,
              is_first_login: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .single();
            
          if (insertError) {
            console.error("Erreur lors de la création du profil de secours:", insertError);
          } else {
            console.log("Profil de secours créé avec succès");
            
            // Récupérer le nouveau profil
            const { data: newProfile, error: newError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
              
            if (!newError) {
              return { data: newProfile, error: null };
            }
          }
        } catch (createError) {
          console.error("Erreur lors de la tentative de création de profil:", createError);
        }
        
        // Return a minimal fallback profile if all else fails
        return { 
          data: { 
            id: userId,
            is_first_login: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, 
          error: null 
        };
      }
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error("Error querying profile:", err);
    
    // En cas d'erreur, fournir un profil de secours
    return { 
      data: { 
        id: userId,
        is_first_login: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, 
      error: { message: err instanceof Error ? err.message : 'Unknown error' } 
    };
  }
};

// Fonction simplifiée pour vérifier la connexion à Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (APP_STATE.isOfflineMode) return false;
  
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    return !error;
  } catch (err) {
    console.error("Erreur de connexion à Supabase:", err);
    return false;
  }
};
