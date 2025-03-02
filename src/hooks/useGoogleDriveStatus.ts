
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { 
  getGoogleRedirectUrl, 
  initiateGoogleAuth, 
  revokeGoogleDriveAccess,
  refreshGoogleToken
} from '@/utils/googleDriveUtils';

// Export these functions for backward compatibility
export { 
  getGoogleRedirectUrl,
  initiateGoogleAuth, 
  revokeGoogleDriveAccess 
} from '@/utils/googleDriveUtils';

// Also re-export getRedirectUrl for backward compatibility
export { getRedirectUrl } from '@/utils/environmentUtils';

export interface ConnectionData {
  email: string;
  connectedSince: Date;
  metadata: any;
}

export const useGoogleDriveStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const { user } = useAuth();

  const checkGoogleDriveConnection = useCallback(async () => {
    // Si pas d'utilisateur connecté, pas besoin de vérifier
    if (!user) {
      setIsConnected(false);
      setIsChecking(false);
      setConnectionData(null);
      return;
    }

    try {
      setIsChecking(true);
      console.log('Vérification du statut Google Drive pour user:', user.id);
      
      const { data, error } = await supabase
        .from('oauth_tokens')
        .select('expires_at, created_at, access_token, metadata')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .maybeSingle();

      if (error) {
        console.error("Erreur lors de la vérification des tokens:", error);
        setIsConnected(false);
        setIsChecking(false);
        setConnectionData(null);
        return;
      }

      // Vérification si le token existe et n'est pas expiré
      if (data) {
        const expiresAt = new Date(data.expires_at);
        const isExpired = expiresAt < new Date();
        console.log('Token trouvé, expire le:', expiresAt, 'Expiré?', isExpired);
        
        // Extraction de l'email avec vérification de type
        let userEmail = "Utilisateur Google";
        if (data.metadata && typeof data.metadata === 'object') {
          userEmail = (data.metadata as Record<string, any>).email || userEmail;
        }
        
        setConnectionData({
          email: userEmail,
          connectedSince: new Date(data.created_at),
          metadata: data.metadata
        });
        
        if (isExpired) {
          console.log("Le token est expiré, tentative de rafraîchissement...");
          
          // Tentative de rafraîchissement du token
          const refreshed = await refreshGoogleToken(user.id);
          setIsConnected(refreshed);
        } else {
          setIsConnected(true);
        }
      } else {
        console.log('Aucun token trouvé pour cet utilisateur');
        setIsConnected(false);
        setConnectionData(null);
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de la connexion Google Drive:", err);
      setIsConnected(false);
      setConnectionData(null);
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  useEffect(() => {
    // Vérification initiale
    checkGoogleDriveConnection();

    // Mettre en place un intervalle pour vérifier régulièrement
    const interval = setInterval(checkGoogleDriveConnection, 60000); // Vérification toutes les minutes

    return () => clearInterval(interval);
  }, [checkGoogleDriveConnection]);

  const reconnectGoogleDrive = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour utiliser cette fonctionnalité",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Connexion à Google Drive",
        description: "Vous allez être redirigé vers Google pour autoriser l'accès",
      });
      
      const authUrl = await initiateGoogleAuth(user.id);
      
      // Rediriger après un court délai pour que l'utilisateur voie la notification
      setTimeout(() => {
        window.location.href = authUrl;
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'auth Google:', error);
      toast({
        title: "Erreur de configuration",
        description: error instanceof Error ? error.message : "Impossible d'initialiser la connexion à Google Drive",
        variant: "destructive",
      });
    }
  };

  const disconnectGoogleDrive = async () => {
    if (!user) {
      return;
    }

    try {
      const success = await revokeGoogleDriveAccess(user.id);
      
      if (success) {
        // Mise à jour de l'état
        setIsConnected(false);
        setConnectionData(null);
        
        toast({
          title: "Déconnexion réussie",
          description: "Votre compte Google Drive a été déconnecté",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion de Google Drive:", error);
      toast({
        title: "Erreur de déconnexion",
        description: error instanceof Error ? error.message : "Impossible de déconnecter votre compte Google Drive",
        variant: "destructive",
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
};
