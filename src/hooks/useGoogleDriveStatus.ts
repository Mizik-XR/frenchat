import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useGoogleDriveStatus = (userId: string) => {
  const [statusData, setStatusData] = useState<{
    status: string;
    configData: any;
    lastUpdated: Date | null;
  }>({
    status: "loading",
    configData: null,
    lastUpdated: null,
  });

  useEffect(() => {
    const fetchGoogleDriveStatus = async () => {
      if (!userId) {
        setStatusData({
          status: "not_configured",
          configData: null,
          lastUpdated: null,
        });
        return;
      }

      try {
        const { data: googleServiceData, error } = await supabase
          .from("service_configurations")
          .select("*")
          .eq("user_id", userId)
          .eq("service_type", "GOOGLE_DRIVE")
          .single();

        if (error) {
          console.error("Erreur lors de la récupération de la configuration Google Drive:", error);
          setStatusData({
            status: "error",
            configData: null,
            lastUpdated: null,
          });
          return;
        }

        if (!googleServiceData) {
          setStatusData({
            status: "not_configured",
            configData: null,
            lastUpdated: null,
          });
          return;
        }

        const status = googleServiceData?.status || 'not_configured';
        const configData = googleServiceData?.config;
        const lastUpdated = googleServiceData?.created_at ? new Date(googleServiceData.created_at) : null;

        setStatusData({
          status: status,
          configData: configData,
          lastUpdated: lastUpdated,
        });
      } catch (error) {
        console.error("Erreur lors de la vérification du statut Google Drive:", error);
        setStatusData({
          status: "error",
          configData: null,
          lastUpdated: null,
        });
      }
    };

    fetchGoogleDriveStatus();
  }, [userId]);

  return statusData;
};
