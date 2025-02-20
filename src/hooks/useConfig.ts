
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Credentials } from "../types/config";

const DEFAULT_CLIENT_EMAIL = "client@cnxria.com";

export const useConfig = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    googleClientId: "",
    googleApiKey: "",
    microsoftClientId: "",
    microsoftTenantId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const initializeClient = async () => {
    try {
      let { data: existingClient } = await supabase
        .from("clients")
        .select()
        .eq("name", DEFAULT_CLIENT_EMAIL)
        .single();

      if (!existingClient) {
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert([{ name: DEFAULT_CLIENT_EMAIL }])
          .select()
          .single();

        if (clientError) throw clientError;
        existingClient = newClient;
      }

      setClientId(existingClient.id);

      const { data: settings } = await supabase
        .from("settings")
        .select()
        .eq("client_id", existingClient.id)
        .single();

      if (settings) {
        setCredentials({
          googleClientId: settings.google_client_id || "",
          googleApiKey: settings.google_api_key || "",
          microsoftClientId: settings.microsoft_client_id || "",
          microsoftTenantId: settings.microsoft_tenant_id || "",
        });
        setIsConfigured(
          Boolean(settings.google_client_id && settings.microsoft_client_id)
        );
      }
    } catch (error: any) {
      console.error("Erreur d'initialisation:", error);
      toast({
        title: "Erreur d'initialisation",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!clientId) {
      toast({
        title: "Erreur",
        description: "Client non initialisé",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error: settingsError } = await supabase
        .from("settings")
        .upsert({
          client_id: clientId,
          google_client_id: credentials.googleClientId,
          google_api_key: credentials.googleApiKey,
          microsoft_client_id: credentials.microsoftClientId,
          microsoft_tenant_id: credentials.microsoftTenantId
        });

      if (settingsError) throw settingsError;

      setIsConfigured(true);
      toast({
        title: "Succès",
        description: "Configuration sauvegardée avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initializeClient();
  }, []);

  return {
    credentials,
    setCredentials,
    isLoading,
    isConfigured,
    handleSave,
  };
};
