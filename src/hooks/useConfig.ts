
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
  const [systemStatus, setSystemStatus] = useState({
    database: false,
    auth: false,
    api: false
  });

  const checkSystemStatus = async () => {
    try {
      // Vérification de la base de données
      const { data: healthCheck, error: dbError } = await supabase
        .from('clients')
        .select('count')
        .single();
      
      setSystemStatus(prev => ({ ...prev, database: !dbError }));
      
      if (dbError) {
        console.warn("État BDD :", dbError);
        toast({
          title: "État système",
          description: "Connexion BDD: NOK - Vérifiez les logs",
          variant: "destructive"
        });
      }

      // Vérification des services externes
      if (credentials.googleClientId || credentials.microsoftClientId) {
        setSystemStatus(prev => ({ ...prev, api: true }));
        console.info("APIs externes configurées");
      }

      // Log de diagnostic
      console.info("État système:", {
        database: !dbError,
        auth: Boolean(supabase.auth.getSession()),
        api: Boolean(credentials.googleClientId || credentials.microsoftClientId)
      });

    } catch (error) {
      console.error("Erreur vérification système:", error);
    }
  };

  const initializeClient = async () => {
    try {
      console.info("Initialisation du client...");
      
      let { data: existingClient, error: clientError } = await supabase
        .from("clients")
        .select()
        .eq("name", DEFAULT_CLIENT_EMAIL)
        .single();

      if (clientError) {
        console.warn("Erreur recherche client:", clientError);
      }

      if (!existingClient) {
        console.info("Création nouveau client:", DEFAULT_CLIENT_EMAIL);
        const { data: newClient, error: createError } = await supabase
          .from("clients")
          .insert([{ name: DEFAULT_CLIENT_EMAIL }])
          .select()
          .single();

        if (createError) {
          console.error("Erreur création client:", createError);
          throw createError;
        }
        existingClient = newClient;
      }

      setClientId(existingClient.id);
      console.info("Client ID:", existingClient.id);

      const { data: settings, error: settingsError } = await supabase
        .from("settings")
        .select()
        .eq("client_id", existingClient.id)
        .single();

      if (settingsError) {
        console.warn("Erreur chargement settings:", settingsError);
      }

      if (settings) {
        console.info("Configuration chargée");
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
      console.error("Client non initialisé");
      toast({
        title: "Erreur",
        description: "Client non initialisé",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.info("Sauvegarde configuration...");
      const { error: settingsError } = await supabase
        .from("settings")
        .upsert({
          client_id: clientId,
          google_client_id: credentials.googleClientId,
          google_api_key: credentials.googleApiKey,
          microsoft_client_id: credentials.microsoftClientId,
          microsoft_tenant_id: credentials.microsoftTenantId
        });

      if (settingsError) {
        console.error("Erreur sauvegarde:", settingsError);
        throw settingsError;
      }

      console.info("Configuration sauvegardée");
      setIsConfigured(true);
      toast({
        title: "Succès",
        description: "Configuration sauvegardée avec succès",
      });
    } catch (error: any) {
      console.error("Erreur sauvegarde:", error);
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
    checkSystemStatus();
  }, []);

  // Log de diagnostic à chaque changement d'état important
  useEffect(() => {
    console.info("État de la configuration:", {
      isConfigured,
      hasGoogleConfig: Boolean(credentials.googleClientId),
      hasMicrosoftConfig: Boolean(credentials.microsoftClientId),
      systemStatus
    });
  }, [isConfigured, credentials, systemStatus]);

  return {
    credentials,
    setCredentials,
    isLoading,
    isConfigured,
    handleSave,
    systemStatus
  };
};
