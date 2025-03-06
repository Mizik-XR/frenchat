
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Type for connection data
interface ConnectionData {
  email?: string;
  connectedSince: Date | null;
  tokenExpiry?: Date;
}

// Function to get the Google OAuth redirect URL
export const getRedirectUrl = (): string => {
  // Implementation of the getRedirectUrl function that returns the Google OAuth redirect URL
  const baseUrl = window.location.origin;
  return `${baseUrl}/google-auth-callback`;
};

// Hook for managing Google Drive connection status
export function useGoogleDriveStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  
  // Vérifie l'état de connexion à Google Drive
  const checkGoogleDriveConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      // Simulation de la vérification du statut (à remplacer par une vraie vérification)
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { action: 'check_connection' }
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.isConnected) {
        setIsConnected(true);
        setConnectionData({
          email: data.email || "utilisateur@gmail.com",
          connectedSince: data.connectedSince ? new Date(data.connectedSince) : new Date(),
          tokenExpiry: data.tokenExpiry ? new Date(data.tokenExpiry) : undefined
        });
      } else {
        setIsConnected(false);
        setConnectionData(null);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de la connexion à Google Drive:", error);
      setIsConnected(false);
      setConnectionData(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Vérifie la connexion au chargement du hook
  useEffect(() => {
    checkGoogleDriveConnection();
  }, [checkGoogleDriveConnection]);

  // Reconnecte l'utilisateur à Google Drive
  const reconnectGoogleDrive = async () => {
    try {
      const authUrl = getRedirectUrl();
      
      // Redirige vers l'URL d'authentification Google
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(authUrl)}&response_type=code&scope=https://www.googleapis.com/auth/drive.readonly%20https://www.googleapis.com/auth/userinfo.email&prompt=consent`;
    } catch (error) {
      console.error("Erreur lors de la reconnexion à Google Drive:", error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter à Google Drive",
        variant: "destructive"
      });
    }
  };

  // Déconnecte l'utilisateur de Google Drive
  const disconnectGoogleDrive = async () => {
    try {
      // Déconnexion via Edge Function
      const { error } = await supabase.functions.invoke('google-oauth', {
        body: { action: 'disconnect' }
      });
      
      if (error) {
        throw error;
      }
      
      setIsConnected(false);
      setConnectionData(null);
      
      toast({
        title: "Déconnecté",
        description: "Vous êtes déconnecté de Google Drive",
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion de Google Drive:", error);
      toast({
        title: "Erreur de déconnexion",
        description: "Impossible de se déconnecter de Google Drive",
        variant: "destructive"
      });
    }
  };

  return {
    isConnected,
    isChecking,
    connectionData,
    checkGoogleDriveConnection,
    reconnectGoogleDrive,
    disconnectGoogleDrive
  };
}
