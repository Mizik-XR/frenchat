
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";

export const useGoogleDriveStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user } = useAuth();

  const checkGoogleDriveConnection = useCallback(async () => {
    // Si pas d'utilisateur connecté, pas besoin de vérifier
    if (!user) {
      setIsConnected(false);
      setIsChecking(false);
      return;
    }

    try {
      setIsChecking(true);
      console.log('Vérification du statut Google Drive pour user:', user.id);
      
      const { data, error } = await supabase
        .from('oauth_tokens')
        .select('expires_at, created_at, access_token')
        .eq('user_id', user.id)
        .eq('provider', 'google')
        .maybeSingle();

      if (error) {
        console.error("Erreur lors de la vérification des tokens:", error);
        setIsConnected(false);
        setIsChecking(false);
        return;
      }

      // Vérification si le token existe et n'est pas expiré
      if (data) {
        const expiresAt = new Date(data.expires_at);
        const isExpired = expiresAt < new Date();
        console.log('Token trouvé, expire le:', expiresAt, 'Expiré?', isExpired);
        
        if (isExpired) {
          console.log("Le token est expiré, tentative de rafraîchissement...");
          
          // Tentative de rafraîchissement du token
          const { data: refreshData, error: refreshError } = await supabase.functions.invoke('google-oauth', {
            body: { action: 'refresh_token', userId: user.id }
          });
          
          if (refreshError || !refreshData?.success) {
            console.error("Erreur lors du rafraîchissement du token:", refreshError || "Token non rafraîchi");
            setIsConnected(false);
          } else {
            console.log("Token rafraîchi avec succès");
            setIsConnected(true);
          }
        } else {
          setIsConnected(true);
        }
      } else {
        console.log('Aucun token trouvé pour cet utilisateur');
        setIsConnected(false);
      }
    } catch (err) {
      console.error("Erreur lors de la vérification de la connexion Google Drive:", err);
      setIsConnected(false);
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
      const { data: authData, error: authError } = await supabase.functions.invoke<{
        client_id: string;
      }>('google-oauth', {
        body: { action: 'get_client_id' }
      });

      if (authError || !authData?.client_id) {
        throw new Error("Impossible de récupérer les informations d'authentification");
      }

      const scopes = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/google/callback`);
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${authData.client_id}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=${scopes}&` +
        `access_type=offline&` +
        `prompt=consent`;

      window.location.href = authUrl;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'auth Google:', error);
      toast({
        title: "Erreur de configuration",
        description: error instanceof Error ? error.message : "Impossible d'initialiser la connexion à Google Drive",
        variant: "destructive",
      });
    }
  };

  return {
    isConnected,
    isChecking,
    checkGoogleDriveConnection,
    reconnectGoogleDrive
  };
};
