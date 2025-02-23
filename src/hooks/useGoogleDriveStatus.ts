
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const useGoogleDriveStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkGoogleDriveConnection = async () => {
      // Si pas d'utilisateur connecté, pas besoin de vérifier
      if (!user) {
        setIsConnected(false);
        return;
      }

      try {
        console.log('Vérification du statut Google Drive pour user:', user.id);
        
        const { data, error } = await supabase
          .from('oauth_tokens')
          .select('expires_at, created_at')
          .eq('user_id', user.id)
          .eq('provider', 'google')
          .maybeSingle();

        if (error) {
          console.error("Erreur lors de la vérification des tokens:", error);
          setIsConnected(false);
          return;
        }

        // Vérification si le token existe et n'est pas expiré
        if (data) {
          const expiresAt = new Date(data.expires_at);
          const isExpired = expiresAt < new Date();
          console.log('Token trouvé, expire le:', expiresAt, 'Expiré?', isExpired);
          setIsConnected(!isExpired);
        } else {
          console.log('Aucun token trouvé pour cet utilisateur');
          setIsConnected(false);
        }
      } catch (err) {
        console.error("Erreur lors de la vérification de la connexion Google Drive:", err);
        setIsConnected(false);
      }
    };

    // Vérification initiale
    checkGoogleDriveConnection();

    // Mettre en place un intervalle pour vérifier régulièrement
    const interval = setInterval(checkGoogleDriveConnection, 60000); // Vérification toutes les minutes

    return () => clearInterval(interval);
  }, [user]);

  return isConnected;
};
