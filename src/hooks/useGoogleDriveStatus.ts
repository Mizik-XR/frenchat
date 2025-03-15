
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { getRedirectUrl, getGoogleOAuthRedirectUrl } from '@/utils/environment/urlUtils';

export interface ConnectionData {
  email: string;
  connectedSince: Date | null;
  tokenExpiry?: Date | null;
}

export const useGoogleDriveStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Vérifier la connexion à Google Drive au chargement
  useEffect(() => {
    if (user) {
      checkGoogleDriveConnection();
    }
  }, [user]);

  // Fonction pour vérifier la connexion à Google Drive
  const checkGoogleDriveConnection = useCallback(async () => {
    if (!user) {
      setIsConnected(false);
      setConnectionData(null);
      return;
    }
    
    setIsChecking(true);
    setError(null);
    
    try {
      console.log("Vérification de la connexion Google Drive pour l'utilisateur:", user.id);
      
      // Vérifier d'abord le statut de la connexion via les configurations de service
      const { data: configData, error: configError } = await supabase
        .from('service_configurations')
        .select('status, created_at, configuration, updated_at')
        .eq('user_id', user.id)
        .eq('service_type', 'GOOGLE_OAUTH')
        .maybeSingle();

      if (configError) {
        console.error('Erreur lors de la vérification du statut Google Drive:', configError);
        setError(`Erreur lors de la vérification: ${configError.message}`);
        setIsConnected(false);
        setConnectionData(null);
        return;
      }
      
      // Si aucune configuration n'existe, essayer de vérifier via les tokens OAuth
      if (!configData) {
        const { data: tokenData, error: tokenError } = await supabase
          .from('oauth_tokens')
          .select('created_at, expires_at, provider_user_info')
          .eq('user_id', user.id)
          .eq('provider', 'google')
          .maybeSingle();

        if (tokenError) {
          console.error('Erreur lors de la vérification des tokens OAuth:', tokenError);
          setError(`Erreur lors de la vérification des tokens: ${tokenError.message}`);
          setIsConnected(false);
          setConnectionData(null);
          return;
        }
        
        if (tokenData) {
          setIsConnected(true);
          const userInfo = tokenData.provider_user_info || {};
          setConnectionData({
            email: userInfo.email || 'Utilisateur Google',
            connectedSince: tokenData.created_at ? new Date(tokenData.created_at) : null,
            tokenExpiry: tokenData.expires_at ? new Date(tokenData.expires_at) : null
          });
          return;
        }
        
        // Aucune configuration ni token trouvé
        setIsConnected(false);
        setConnectionData(null);
        return;
      }
      
      // Configuration trouvée, vérifier son statut
      if (configData && configData.status === 'configured') {
        setIsConnected(true);
        
        // Extraire les informations de connexion
        const configuration = configData.configuration as Record<string, any> || {};
        setConnectionData({
          email: configuration?.email || 'Utilisateur Google',
          connectedSince: configData.created_at ? new Date(configData.created_at) : null,
          tokenExpiry: configuration?.expires_at ? new Date(configuration.expires_at) : null
        });
      } else {
        setIsConnected(false);
        setConnectionData(null);
      }
    } catch (error: any) {
      console.error('Erreur inattendue lors de la vérification de la connexion:', error);
      setError(`Erreur inattendue: ${error.message || 'Erreur inconnue'}`);
      setIsConnected(false);
      setConnectionData(null);
    } finally {
      setIsChecking(false);
    }
  }, [user, toast]);

  // Fonction pour se connecter à Google Drive
  const reconnectGoogleDrive = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentification requise",
        description: "Vous devez être connecté pour utiliser Google Drive.",
        variant: "destructive",
      });
      return;
    }
    
    setIsChecking(true);
    setError(null);
    
    try {
      console.log("Tentative de connexion à Google Drive pour l'utilisateur:", user.id);
      
      // Utiliser la fonction pour obtenir l'URL de redirection Google OAuth
      const redirectUrl = getGoogleOAuthRedirectUrl();
      console.log("URL de redirection Google OAuth:", redirectUrl);
      
      // Appeler la Edge Function pour obtenir l'URL d'authentification
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { 
          action: 'get_auth_url',
          redirectUrl: redirectUrl,
          userId: user.id
        }
      });
      
      if (error || !data?.auth_url) {
        console.error('Erreur lors de la génération de l\'URL d\'authentification:', error || 'URL non générée');
        setError(`Erreur lors de la connexion: ${error?.message || 'Impossible de générer l\'URL d\'authentification'}`);
        toast({
          title: "Erreur de connexion",
          description: "Impossible de se connecter à Google Drive.",
          variant: "destructive",
        });
      } else {
        // Rediriger vers l'URL d'authentification Google
        console.log("Redirection vers l'URL d'authentification Google:", data.auth_url);
        window.location.href = data.auth_url;
      }
    } catch (error: any) {
      console.error('Erreur lors de la reconnexion:', error);
      setError(`Erreur lors de la connexion: ${error.message || 'Erreur inconnue'}`);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur s'est produite lors de la tentative de connexion.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  }, [user, toast]);

  // Fonction pour se déconnecter de Google Drive
  const disconnectGoogleDrive = useCallback(async () => {
    if (!user) return;
    
    setIsChecking(true);
    setError(null);
    
    try {
      console.log("Déconnexion de Google Drive pour l'utilisateur:", user.id);
      
      // Révoquer le token via la Edge Function
      const { error: revokeError } = await supabase.functions.invoke('google-oauth', {
        body: { 
          action: 'revoke_token',
          userId: user.id
        }
      });
      
      if (revokeError) {
        console.error('Erreur lors de la révocation du token:', revokeError);
        setError(`Erreur lors de la déconnexion: ${revokeError.message || 'Impossible de révoquer le token'}`);
        toast({
          title: "Erreur de déconnexion",
          description: "Impossible de déconnecter Google Drive.",
          variant: "destructive",
        });
        return;
      }
      
      // Supprimer la configuration et les tokens
      const { error: deleteConfigError } = await supabase
        .from('service_configurations')
        .delete()
        .eq('user_id', user.id)
        .eq('service_type', 'GOOGLE_OAUTH');
      
      if (deleteConfigError) {
        console.error('Erreur lors de la suppression de la configuration:', deleteConfigError);
      }
      
      const { error: deleteTokenError } = await supabase
        .from('oauth_tokens')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', 'google');
      
      if (deleteTokenError) {
        console.error('Erreur lors de la suppression du token:', deleteTokenError);
      }
      
      setIsConnected(false);
      setConnectionData(null);
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté de Google Drive.",
      });
    } catch (error: any) {
      console.error('Erreur lors de la déconnexion:', error);
      setError(`Erreur lors de la déconnexion: ${error.message || 'Erreur inconnue'}`);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur s'est produite lors de la tentative de déconnexion.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  }, [user, toast]);

  return {
    isConnected,
    isChecking,
    connectionData,
    error,
    checkGoogleDriveConnection,
    reconnectGoogleDrive,
    disconnectGoogleDrive
  };
};

export { getRedirectUrl, getGoogleOAuthRedirectUrl };
