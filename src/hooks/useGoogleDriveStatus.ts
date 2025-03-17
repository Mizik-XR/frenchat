
import { useState, useEffect } from '@/core/ReactInstance';
import { supabase } from '@/integrations/supabase/client';

// Fonction de redirection interne - ne pas confondre avec l'import
function _getRedirectUrl(): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/google-auth-callback`;
}

// Export pour compatibilité
export function getRedirectUrl(): string {
  return _getRedirectUrl();
}

export function useGoogleDriveStatus() {
  const [status, setStatus] = useState('disconnected');
  const [configData, setConfigData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Récupérer l'état de connexion de Google Drive
  const fetchStatus = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData?.user) {
        setStatus('unauthenticated');
        return;
      }
      
      const { data: driveConfig, error } = await supabase
        .from('google_drive_configs')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error || !driveConfig) {
        setStatus('disconnected');
        return;
      }
      
      // Vérifier si le token est toujours valide (basé sur expires_at)
      const now = new Date();
      const expiresAt = new Date(driveConfig.expires_at);
      
      if (expiresAt < now) {
        setStatus('expired');
      } else {
        setStatus('connected');
        setConfigData(driveConfig);
      }
      
    } catch (error) {
      console.error('Error fetching Google Drive status:', error);
      setStatus('error');
    }
    
    setLastUpdated(new Date());
  };

  // Méthode pour rafraîchir le statut
  const refreshStatus = async () => {
    await fetchStatus();
  };

  // Charger le statut au montage du composant
  useEffect(() => {
    fetchStatus();
  }, []);

  // Pour compatibilité avec l'ancien code
  const reconnectGoogleDrive = async () => {
    console.log("Redirecting to Google auth...");
    // Rediriger vers l'authentification Google
    window.location.href = `/api/google-oauth?redirect=${encodeURIComponent(_getRedirectUrl())}`;
  };

  return {
    status,       // 'connected', 'disconnected', 'expired', 'error', 'unauthenticated'
    configData,   // données de configuration ou null
    lastUpdated,  // dernière mise à jour
    refreshStatus,  // fonction pour rafraîchir
    // Pour compatibilité avec l'ancien code
    isConnected: status === 'connected',
    reconnectGoogleDrive
  };
}
