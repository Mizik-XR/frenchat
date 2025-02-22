
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

export const useGoogleDriveStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkGoogleDriveConnection = async () => {
      if (!user) {
        setIsConnected(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('oauth_tokens')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'google')
          .maybeSingle();

        setIsConnected(!!data && !error);
      } catch (err) {
        console.error("Erreur lors de la vérification de la connexion Google Drive:", err);
        setIsConnected(false);
      }
    };

    checkGoogleDriveConnection();
  }, [user]);

  return isConnected;
};
