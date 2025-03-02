
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";
import { 
  getMicrosoftRedirectUrl, 
  initiateMicrosoftAuth, 
  revokeMicrosoftTeamsAccess,
  refreshMicrosoftToken
} from '@/utils/microsoftTeamsUtils';
import { useServiceConfiguration } from './useServiceConfiguration';

export interface ConnectionData {
  email: string;
  connectedSince: Date;
  metadata: any;
}

export const useMicrosoftTeamsStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);
  const { user } = useAuth();
  const { config } = useServiceConfiguration('microsoft_teams');

  const checkMicrosoftTeamsConnection = useCallback(async () => {
    // Si pas d'utilisateur connecté, pas besoin de vérifier
    if (!user) {
      setIsConnected(false);
      setIsChecking(false);
      setConnectionData(null);
      return;
    }

    try {
      setIsChecking(true);
      console.log('Vérification du statut Microsoft Teams pour user:', user.id);
      
      const { data, error } = await supabase
        .from('oauth_tokens')
        .select('expires_at, created_at, access_token, metadata')
        .eq('user_id', user.id)
        .eq('provider', 'microsoft')
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
        let userEmail = "Utilisateur Microsoft";
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
          const refreshed = await refreshMicrosoftToken(user.id);
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
      console.error("Erreur lors de la vérification de la connexion Microsoft Teams:", err);
      setIsConnected(false);
      setConnectionData(null);
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  useEffect(() => {
    // Vérification initiale
    checkMicrosoftTeamsConnection();

    // Mettre en place un intervalle pour vérifier régulièrement
    const interval = setInterval(checkMicrosoftTeamsConnection, 60000); // Vérification toutes les minutes

    return () => clearInterval(interval);
  }, [checkMicrosoftTeamsConnection]);

  const reconnectMicrosoftTeams = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour utiliser cette fonctionnalité",
        variant: "destructive",
      });
      return;
    }

    if (!config?.tenantId) {
      toast({
        title: "Configuration manquante",
        description: "Veuillez d'abord configurer Microsoft Teams avec un Tenant ID",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Connexion à Microsoft Teams",
        description: "Vous allez être redirigé vers Microsoft pour autoriser l'accès",
      });
      
      const authUrl = await initiateMicrosoftAuth(user.id, config.tenantId);
      
      // Rediriger après un court délai pour que l'utilisateur voie la notification
      setTimeout(() => {
        window.location.href = authUrl;
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'auth Microsoft:', error);
      toast({
        title: "Erreur de configuration",
        description: error instanceof Error ? error.message : "Impossible d'initialiser la connexion à Microsoft Teams",
        variant: "destructive",
      });
    }
  };

  const disconnectMicrosoftTeams = async () => {
    if (!user) {
      return;
    }

    try {
      const success = await revokeMicrosoftTeamsAccess(user.id);
      
      if (success) {
        // Mise à jour de l'état
        setIsConnected(false);
        setConnectionData(null);
        
        toast({
          title: "Déconnexion réussie",
          description: "Votre compte Microsoft Teams a été déconnecté",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la déconnexion de Microsoft Teams:", error);
      toast({
        title: "Erreur de déconnexion",
        description: error instanceof Error ? error.message : "Impossible de déconnecter votre compte Microsoft Teams",
        variant: "destructive",
      });
    }
  };

  return {
    isConnected,
    isChecking,
    connectionData,
    checkMicrosoftTeamsConnection,
    reconnectMicrosoftTeams,
    disconnectMicrosoftTeams
  };
};
