import { useState, useCallback  } from '@/core/reactInstance';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { getRedirectUrl } from '@/utils/environment/urlUtils';

export interface ConnectionData {
  email: string;
  connectedSince: Date | null;
  tokenExpiry?: Date | null;
}

export const useGoogleDriveStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const checkGoogleDriveConnection = useCallback(async () => {
    if (!user) return;
    
    setIsChecking(true);
    try {
      // Vérifier le statut de la connexion à Google Drive
      const { data, error } = await supabase
        .from('service_configurations')
        .select('status, created_at, config_data')
        .eq('user_id', user.id)
        .eq('service_type', 'google_drive')
        .single();

      if (error) {
        console.error('Erreur lors de la vérification du statut Google Drive:', error);
        setIsConnected(false);
        setConnectionData(null);
      } else if (data && data.status === 'configured') {
        setIsConnected(true);
        
        // Extraire les informations de connexion
        const configData = data.config_data as Record<string, any>;
        setConnectionData({
          email: configData?.email || 'Utilisateur Google',
          connectedSince: data.created_at ? new Date(data.created_at) : null,
          tokenExpiry: configData?.expires_at ? new Date(configData.expires_at) : null
        });
      } else {
        setIsConnected(false);
        setConnectionData(null);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de la connexion:', error);
      setIsConnected(false);
      setConnectionData(null);
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  const reconnectGoogleDrive = useCallback(async () => {
    // Rediriger vers le flow d'OAuth de Google
    try {
      // Cette URL doit correspondre à votre configuration Supabase/Google OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/drive.readonly',
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Erreur lors de la connexion à Google:', error);
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter à Google Drive.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la reconnexion:', error);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur s'est produite lors de la tentative de connexion.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const disconnectGoogleDrive = useCallback(async () => {
    if (!user) return;
    
    try {
      // Supprimer la configuration Google Drive pour cet utilisateur
      const { error } = await supabase
        .from('service_configurations')
        .delete()
        .eq('user_id', user.id)
        .eq('service_type', 'google_drive');

      if (error) {
        console.error('Erreur lors de la déconnexion de Google Drive:', error);
        toast({
          title: "Erreur de déconnexion",
          description: "Impossible de déconnecter Google Drive.",
          variant: "destructive",
        });
      } else {
        setIsConnected(false);
        setConnectionData(null);
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté de Google Drive.",
        });
      }
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la tentative de déconnexion.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  return {
    isConnected,
    isChecking,
    connectionData,
    checkGoogleDriveConnection,
    reconnectGoogleDrive,
    disconnectGoogleDrive,
    getRedirectUrl
  };
};

export { getRedirectUrl };
