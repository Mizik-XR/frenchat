
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getRedirectUrl } from "@/utils/environment/urlUtils";

export const getRedirectUrl = (path: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/${path}`;
};

export interface GoogleDriveConnectionData {
  email?: string;
  connectedSince: Date | null;
}

export const useGoogleDriveStatus = (userId?: string) => {
  const [status, setStatus] = useState<"loading" | "connected" | "disconnected" | "error">("loading");
  const [configData, setConfigData] = useState<any>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Propriétés exposées pour compatibilité avec le code existant
  const isConnected = status === "connected";
  const connectionData: GoogleDriveConnectionData | null = configData ? {
    email: configData.email || null,
    connectedSince: lastUpdated
  } : null;

  const checkGoogleDriveConnection = useCallback(async () => {
    if (!userId) {
      setStatus("disconnected");
      return;
    }

    setIsChecking(true);
    try {
      const { data: googleServiceData, error } = await supabase
        .from("service_configurations")
        .select("*")
        .eq("user_id", userId)
        .eq("service_type", "GOOGLE_DRIVE")
        .single();

      if (error) {
        console.error("Erreur lors de la récupération de la configuration Google Drive:", error);
        setStatus("error");
        setIsChecking(false);
        return;
      }

      if (!googleServiceData) {
        setStatus("disconnected");
        setIsChecking(false);
        return;
      }

      // Mise à jour des états
      const serviceStatus = googleServiceData.status || 'not_configured';
      const serviceConfig = googleServiceData.config;
      const createdAt = googleServiceData.created_at ? new Date(googleServiceData.created_at) : null;

      setStatus(serviceStatus === 'configured' ? 'connected' : 'disconnected');
      setConfigData(serviceConfig);
      setLastUpdated(createdAt);
    } catch (error) {
      console.error("Erreur lors de la vérification du statut Google Drive:", error);
      setStatus("error");
    } finally {
      setIsChecking(false);
    }
  }, [userId]);

  const reconnectGoogleDrive = useCallback(async () => {
    setIsChecking(true);
    try {
      // Utiliser getRedirectUrl depuis les utilitaires d'environnement
      const redirectUri = getRedirectUrl('auth/google/callback');

      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: {
          code: null,
          redirectUrl: redirectUri,
          action: 'get_client_id'
        }
      });

      if (error || !data?.client_id) {
        throw new Error("Impossible de récupérer les informations d'authentification");
      }

      // Construction de l'URL d'autorisation
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${data.client_id}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly&access_type=offline&prompt=consent`;

      // Redirection vers Google pour l'authentification
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Erreur lors de l'authentification Google Drive:", error);
      toast({
        title: "Erreur d'authentification",
        description: "Impossible de démarrer l'authentification Google Drive.",
        variant: "destructive",
      });
      setStatus("error");
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
        .eq('provider', 'google');
      
      if (deleteError) throw deleteError;
      
      // 2. Mettre à jour le statut local
      setStatus("disconnected");
      setConfigData(null);
      
      toast({
        title: "Déconnexion réussie",
        description: "Votre compte Google Drive a été déconnecté",
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  }, [userId]);

  // Effet initial pour vérifier la connexion
  useEffect(() => {
    checkGoogleDriveConnection();
  }, [userId, checkGoogleDriveConnection]);

  return {
    status,
    configData,
    lastUpdated,
    isChecking,
    // Propriétés et méthodes exposées pour compatibilité
    isConnected,
    connectionData,
    checkGoogleDriveConnection,
    reconnectGoogleDrive,
    disconnectGoogleDrive
  };
};
