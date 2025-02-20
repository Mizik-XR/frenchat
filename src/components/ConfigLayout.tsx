
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Save } from "lucide-react";
import { GoogleDriveConfig } from "./config/GoogleDriveConfig";
import { MicrosoftTeamsConfig } from "./config/MicrosoftTeamsConfig";
import { useConfig } from "@/hooks/useConfig";

export const ConfigLayout = () => {
  const { credentials, setCredentials, isLoading, isConfigured, handleSave } = useConfig();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Configuration CNXRIA
          </h2>
          <p className="mt-2 text-gray-600">
            {isConfigured
              ? "Vos identifiants API sont configurés"
              : "Configurez vos identifiants API pour commencer"}
          </p>
        </div>

        <Card className="glass-panel p-6 space-y-6">
          <GoogleDriveConfig 
            credentials={credentials}
            setCredentials={setCredentials}
          />

          <MicrosoftTeamsConfig 
            credentials={credentials}
            setCredentials={setCredentials}
          />

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
