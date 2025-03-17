
import { useState, useEffect, useCallback } from '@/core/ReactInstance';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useToast } from './use-toast';

export function useGoogleDriveStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState('not_configured');
  const [configData, setConfigData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isChecking, setIsChecking] = useState(false);
  const [connectionData, setConnectionData] = useState(null);
  const { toast } = useToast();

  // Fonction pour rafraîchir le statut
  const refreshStatus = useCallback(async () => {
    if (!user) return;
    
    setIsChecking(true);

    try {
      const { data, error } = await supabase
        .from('service_configurations')
        .select('*')
        .eq('user_id', user.id)
        .eq('service_type', 'google_drive')
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Code for "no rows returned"
          console.error("Erreur lors de la vérification du statut Google Drive:", error);
        }
        setStatus('not_configured');
        setConfigData(null);
      } else if (data) {
        setStatus(data.status);
        setConfigData(data.config);
        
        // Vérifier si le token est valide (pas expiré)
        if (data.config && data.config.access_token) {
          const expiresAt = new Date(data.config.expires_at || 0);
          const now = new Date();
          
          if (expiresAt < now) {
            setStatus('token_expired');
          }
        }
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Exception lors de la vérification du statut Google Drive:", error);
      setStatus('error');
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  // Fonction pour vérifier la connexion
  const checkGoogleDriveConnection = async () => {
    if (!user) return;
    
    setIsChecking(true);
    
    try {
      // Endpoint pour vérifier la connexion
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { action: 'check_connection' }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setConnectionData(data);
      setStatus(data.connected ? 'configured' : 'not_configured');
      
      return data;
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion:", error);
      setStatus('error');
      return null;
    } finally {
      setIsChecking(false);
    }
  };
  
  // Fonction pour reconnecter
  const reconnectGoogleDrive = async () => {
    toast({
      title: "Reconnexion à Google Drive",
      description: "Tentative de reconnexion en cours..."
    });
    
    try {
      // Endpoint pour se reconnecter
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { action: 'refresh_token' }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      await refreshStatus();
      
      toast({
        title: "Reconnexion réussie",
        description: "La connexion à Google Drive a été rétablie."
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la reconnexion:", error);
      toast({
        title: "Erreur de reconnexion",
        description: "Impossible de rétablir la connexion à Google Drive.",
        variant: "destructive"
      });
      
      return false;
    }
  };
  
  // Fonction pour déconnecter
  const disconnectGoogleDrive = async () => {
    if (!user) return false;
    
    try {
      // Supprimer la configuration
      const { error } = await supabase
        .from('service_configurations')
        .delete()
        .eq('user_id', user.id)
        .eq('service_type', 'google_drive');
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Révoquer le token sur Google
      await supabase.functions.invoke('google-oauth', {
        body: { action: 'revoke_token' }
      });
      
      setStatus('not_configured');
      setConfigData(null);
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté de Google Drive."
      });
      
      return true;
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur de déconnexion",
        description: "Impossible de vous déconnecter de Google Drive.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  // Vérifier le statut au chargement
  useEffect(() => {
    if (user) {
      refreshStatus();
    }
  }, [user, refreshStatus]);

  // Pour la compatibilité avec le code existant qui utilise isConnected
  const isConnected = status === 'configured';

  return {
    status,
    configData,
    lastUpdated,
    refreshStatus,
    isConnected,
    reconnectGoogleDrive,
    isChecking,
    connectionData,
    checkGoogleDriveConnection,
    disconnectGoogleDrive
  };
}
