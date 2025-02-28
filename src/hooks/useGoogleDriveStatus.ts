
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "@/hooks/use-toast";

// Définir l'URL de redirection pour OAuth de manière dynamique
export const getRedirectUrl = () => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin
    : process.env.VITE_SITE_URL || 'http://localhost:5173';
  
  return `${baseUrl}/auth/google/callback`;
};

export const useGoogleDriveStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [connectionData, setConnectionData] = useState<any>(null);
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
        
        setConnectionData({
          // Utiliser les données disponibles dans metadata au lieu de user_email
          email: data.metadata?.email || "Utilisateur Google",
          connectedSince: new Date(data.created_at),
          metadata: data.metadata
        });
        
        if (isExpired) {
          console.log("Le token est expiré, tentative de rafraîchissement...");
          
          // Tentative de rafraîchissement du token
          const { data: refreshData, error: refreshError } = await supabase.functions.invoke('google-oauth', {
            body: { 
              action: 'refresh_token', 
              userId: user.id,
              redirectUrl: getRedirectUrl()
            }
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
      const redirectUri = getRedirectUrl();
      console.log("URL de redirection configurée:", redirectUri);
      
      const { data: authData, error: authError } = await supabase.functions.invoke<{
        client_id: string;
      }>('google-oauth', {
        body: { 
          action: 'get_client_id',
          redirectUrl: redirectUri
        }
      });

      if (authError || !authData?.client_id) {
        throw new Error("Impossible de récupérer les informations d'authentification");
      }

      // Demande de scopes étendus pour l'accès aux fichiers
      const scopes = encodeURIComponent(
        'https://www.googleapis.com/auth/drive.file ' +
        'https://www.googleapis.com/auth/drive.metadata.readonly ' +
        'https://www.googleapis.com/auth/userinfo.email ' +
        'https://www.googleapis.com/auth/userinfo.profile'
      );
      
      const redirectUrl = encodeURIComponent(redirectUri);
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${authData.client_id}&` +
        `redirect_uri=${redirectUrl}&` +
        `response_type=code&` +
        `scope=${scopes}&` +
        `access_type=offline&` +
        `prompt=consent`;

      console.log("Redirection vers:", authUrl);
      
      // Afficher une notification avant la redirection
      toast({
        title: "Connexion à Google Drive",
        description: "Vous allez être redirigé vers Google pour autoriser l'accès",
      });
      
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
      // Révoquer le token d'accès côté Google
      const { error: revokeError } = await supabase.functions.invoke('google-oauth', {
        body: { 
          action: 'revoke_token',
          userId: user.id
        }
      });

      if (revokeError) {
        console.error("Erreur lors de la révocation du token:", revokeError);
        // On continue pour supprimer le token côté Supabase même si la révocation échoue chez Google
      }

      // Supprimer le token de la base de données
      const { error: deleteError } = await supabase
        .from('oauth_tokens')
        .delete()
        .eq('user_id', user.id)
        .eq('provider', 'google');

      if (deleteError) {
        throw new Error("Erreur lors de la suppression du token local");
      }

      // Mise à jour de l'état
      setIsConnected(false);
      setConnectionData(null);
      
      toast({
        title: "Déconnexion réussie",
        description: "Votre compte Google Drive a été déconnecté",
      });
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
