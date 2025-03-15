
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from './useAuthSession';
import { DateTime } from 'luxon';

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
  const { session } = useAuthSession();
  const [status, setStatus] = useState<GoogleDriveStatus>({
    isConnected: false,
    isLoading: true,
    isConfigured: false
  });

  const userId = session?.user?.id;

  const checkConnectionStatus = async () => {
    if (!userId) {
      setStatus(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setStatus(prev => ({ ...prev, isLoading: true }));

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
        userInfo = authTokens.provider_user_info || {};
        const createdAt = authTokens.created_at ? new Date(authTokens.created_at) : null;
        const expiresAt = authTokens.expires_at ? new Date(authTokens.expires_at) : null;
        isConnected = true;
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

      const isConfigured = serviceConfig ? serviceConfig.status === 'configured' : false;
      const configDetails = serviceConfig?.configuration || {};
      const configuredAt = serviceConfig ? new Date(serviceConfig.created_at) : undefined;

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
        clientId: configDetails?.client_id,
        lastError: serviceConfig?.error_message
      });
    } catch (error) {
      console.error('Erreur lors de la vérification du statut Google Drive:', error);
      setStatus({
        isConnected: false,
        isLoading: false,
        isConfigured: false,
        lastError: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    }
  };

  useEffect(() => {
    if (userId) {
      checkConnectionStatus();
    } else {
      setStatus({
        isConnected: false,
        isLoading: false,
        isConfigured: false
      });
    }
  }, [userId]);

  return {
    ...status,
    refreshStatus: checkConnectionStatus
  };
};
