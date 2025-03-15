
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { DateTime } from 'luxon';
import { getRedirectUrl } from '@/utils/environment/urlUtils';

export type GoogleDriveConnectionData = {
  email?: string;
  connectedSince?: Date;
  tokenExpiry?: Date;
  userName?: string;
  profilePicture?: string;
};

export type GoogleDriveStatus = {
  isConnected: boolean;
  userName?: string;
  email?: string;
  profilePicture?: string;
  tokensExpireAt?: Date;
  tokenCreatedAt?: Date;
  lastError?: string;
  isLoading: boolean;
  isConfigured: boolean;
  configuredAt?: Date;
  clientId?: string;
};

export const useGoogleDriveStatus = () => {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [connectionData, setConnectionData] = useState<GoogleDriveConnectionData | null>(null);
  const [status, setStatus] = useState<GoogleDriveStatus>({
    isConnected: false,
    isLoading: true,
    isConfigured: false
  });
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id;

  const checkGoogleDriveConnection = useCallback(async () => {
    if (!userId) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      // Vérifier si nous avons un token d'accès pour Google
      const { data: authTokens, error: authError } = await supabase
        .from('oauth_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', 'google_drive')
        .single();

      if (authError && !authError.message.includes('No rows found')) {
        console.error('Erreur lors de la vérification des tokens OAuth:', authError);
        throw new Error(`Erreur de récupération des tokens: ${authError.message}`);
      }

      let isConnected = false;
      let userInfo = null;

      if (authTokens) {
        // Extraire les informations utilisateur du token
        userInfo = authTokens.provider_user_info ? authTokens.provider_user_info : {};
        const createdAt = authTokens.created_at ? new Date(authTokens.created_at) : null;
        const expiresAt = authTokens.expires_at ? new Date(authTokens.expires_at) : null;
        isConnected = true;

        // Set connection data
        setConnectionData({
          email: userInfo?.email,
          connectedSince: createdAt,
          tokenExpiry: expiresAt,
          userName: userInfo?.name,
          profilePicture: userInfo?.picture
        });
      } else {
        setConnectionData(null);
      }

      // Vérifier aussi la configuration du service Google Drive
      const { data: serviceConfig, error: configError } = await supabase
        .from('service_configurations')
        .select('*')
        .eq('service_type', 'GOOGLE_OAUTH')
        .maybeSingle();

      if (configError) {
        console.error('Erreur lors de la vérification de la configuration Google Drive:', configError);
      }

      let configDetails = {};
      if (serviceConfig?.configuration) {
        try {
          configDetails = typeof serviceConfig.configuration === 'string' 
            ? JSON.parse(serviceConfig.configuration) 
            : serviceConfig.configuration;
        } catch (e) {
          console.error('Erreur de parsing de la configuration:', e);
        }
      }

      const isConfigured = serviceConfig ? serviceConfig.status === 'configured' : false;
      const configuredAt = serviceConfig ? new Date(serviceConfig.created_at) : undefined;
      
      // Extract client_id safely
      const clientId = typeof configDetails === 'object' && configDetails ? 
        (configDetails as any).client_id : undefined;

      setStatus({
        isConnected,
        userName: userInfo?.name,
        email: userInfo?.email,
        profilePicture: userInfo?.picture,
        tokensExpireAt: authTokens?.expires_at ? new Date(authTokens.expires_at) : undefined,
        tokenCreatedAt: authTokens?.created_at ? new Date(authTokens.created_at) : undefined,
        isLoading: false,
        isConfigured,
        configuredAt,
        clientId,
        lastError: serviceConfig?.error_message
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du statut Google Drive:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      setStatus({
        isConnected: false,
        isLoading: false,
        isConfigured: false,
        lastError: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsChecking(false);
    }
  }, [userId]);

  const reconnectGoogleDrive = useCallback(async () => {
    setIsChecking(true);
    try {
      const redirectUri = getRedirectUrl('auth/google/callback');
      const { data, error } = await supabase.functions.invoke('unified-oauth-proxy', {
        body: { 
          provider: 'google',
          action: 'get_client_id',
          redirectUrl: redirectUri
        }
      });

      if (error || !data?.client_id) {
        throw new Error("Impossible de récupérer les informations d'authentification");
      }

      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${data.client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly&access_type=offline&prompt=consent`;
      
      window.location.href = googleAuthUrl;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
      console.error("Erreur lors de la reconnexion à Google Drive:", error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  const disconnectGoogleDrive = useCallback(async () => {
    if (!userId) return;
    
    setIsChecking(true);
    try {
      // 1. Supprimer le token de la base de données
      const { error: deleteError } = await supabase
        .from('oauth_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('provider', 'google_drive');
      
      if (deleteError) throw deleteError;
      
      // 2. Mettre à jour le statut
      setStatus(prev => ({
        ...prev,
        isConnected: false,
      }));
      
      setConnectionData(null);
      await checkGoogleDriveConnection();
    } catch (error) {
      console.error('Erreur lors de la déconnexion de Google Drive:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsChecking(false);
    }
  }, [userId, checkGoogleDriveConnection]);

  useEffect(() => {
    if (userId) {
      checkGoogleDriveConnection();
    } else {
      setStatus({
        isConnected: false,
        isLoading: false,
        isConfigured: false
      });
    }
  }, [userId, checkGoogleDriveConnection]);

  return {
    ...status,
    refreshStatus: checkGoogleDriveConnection,
    isChecking,
    connectionData,
    error,
    checkGoogleDriveConnection,
    reconnectGoogleDrive,
    disconnectGoogleDrive
  };
};

// Export the utility for getting redirect URL for other components
export const getRedirectUrl = (path: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/${path}`;
};
