
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Settings, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export interface Credentials {
  googleClientId: string;
  googleApiKey: string;
  microsoftClientId: string;
  microsoftTenantId: string;
}

const DEFAULT_CLIENT_EMAIL = "client@cnxria.com";

export const ConfigLayout = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    googleClientId: "",
    googleApiKey: "",
    microsoftClientId: "",
    microsoftTenantId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  useEffect(() => {
    initializeClient();
  }, []);

  const initializeClient = async () => {
    try {
      // Vérifier si le client existe déjà
      let { data: existingClient } = await supabase
        .from("clients")
        .select()
        .eq("name", DEFAULT_CLIENT_EMAIL)
        .single();

      if (!existingClient) {
        // Créer le client s'il n'existe pas
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          .insert([{ name: DEFAULT_CLIENT_EMAIL }])
          .select()
          .single();

        if (clientError) throw clientError;
        existingClient = newClient;
      }

      setClientId(existingClient.id);

      // Charger les paramètres existants
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
      // Sauvegarder les paramètres
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 slide-up">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Configuration CNXRIA
          </h2>
          <p className="mt-2 text-gray-600">
            Configurez vos identifiants API pour Google Drive et Microsoft Teams
          </p>
        </div>

        <Card className="glass-panel p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Google Drive</h3>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="googleClientId">Client ID</Label>
                <Input
                  id="googleClientId"
                  value={credentials.googleClientId}
                  onChange={(e) =>
                    setCredentials({ ...credentials, googleClientId: e.target.value })
                  }
                  className="input-field"
                  placeholder="Entrez votre Google Client ID"
                />
              </div>
              <div>
                <Label htmlFor="googleApiKey">Clé API</Label>
                <Input
                  id="googleApiKey"
                  value={credentials.googleApiKey}
                  onChange={(e) =>
                    setCredentials({ ...credentials, googleApiKey: e.target.value })
                  }
                  className="input-field"
                  placeholder="Entrez votre Google API Key"
                  type="password"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">Microsoft Teams</h3>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="microsoftClientId">Client ID</Label>
                <Input
                  id="microsoftClientId"
                  value={credentials.microsoftClientId}
                  onChange={(e) =>
                    setCredentials({ ...credentials, microsoftClientId: e.target.value })
                  }
                  className="input-field"
                  placeholder="Entrez votre Microsoft Client ID"
                />
              </div>
              <div>
                <Label htmlFor="microsoftTenantId">Tenant ID</Label>
                <Input
                  id="microsoftTenantId"
                  value={credentials.microsoftTenantId}
                  onChange={(e) =>
                    setCredentials({ ...credentials, microsoftTenantId: e.target.value })
                  }
                  className="input-field"
                  placeholder="Entrez votre Microsoft Tenant ID"
                  type="password"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="hover-scale"
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Sauvegarde..." : "Sauvegarder"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
