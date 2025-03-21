
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

/**
 * Précharge la session utilisateur depuis Supabase
 */
export const preloadSession = async (): Promise<Session | null> => {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session;
  } catch (error) {
    console.error("Erreur lors du préchargement de la session:", error);
    return null;
  }
};

/**
 * Récupère les informations du profil utilisateur
 */
export const fetchUserProfile = async (userId: string) => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error("Erreur lors de la récupération du profil utilisateur:", error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Exception lors de la récupération du profil:", error);
    return null;
  }
};

/**
 * Rafraîchit la session en cas d'expiration imminente
 */
export const refreshSessionIfNeeded = async (session: Session): Promise<boolean> => {
  if (!session) return false;
  
  // Calculer le temps restant avant expiration
  const expiresAt = new Date((session.expires_at || 0) * 1000);
  const now = new Date();
  const timeUntilExpiry = expiresAt.getTime() - now.getTime();
  
  // Si moins de 5 minutes restantes, rafraîchir
  if (timeUntilExpiry < 5 * 60 * 1000) {
    try {
      const { data, error } = await supabase.auth.refreshSession(session);
      if (error) throw error;
      return !!data.session;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement de la session:", error);
      return false;
    }
  }
  
  return true;
};
