
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleConfig } from "@/types/config";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface GoogleDriveConfigProps {
  config: GoogleConfig;
  onConfigChange: (config: GoogleConfig) => void;
  onSave: () => void;
}

export const GoogleDriveConfig = ({ config, onConfigChange, onSave }: GoogleDriveConfigProps) => {
  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Configuration Google Drive</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-5 w-5 text-primary/60" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm">
              <p>Pour obtenir vos identifiants Google Drive :</p>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Accédez à la Console Google Cloud</li>
                <li>Créez un projet ou sélectionnez-en un existant</li>
                <li>Activez l'API Google Drive</li>
                <li>Créez des identifiants OAuth 2.0</li>
              </ol>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="grid gap-6">
        <div>
          <Label htmlFor="googleClientId">
            Client ID
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="ml-1">
                  <Info className="h-4 w-4 text-primary/60 inline" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>L'identifiant client OAuth 2.0 de votre application Google Cloud</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            id="googleClientId"
            value={config.clientId}
            onChange={(e) =>
              onConfigChange({ ...config, clientId: e.target.value })
            }
            className="input-field mt-1"
            placeholder="Entrez votre Google Client ID"
          />
        </div>

        <div>
          <Label htmlFor="googleApiKey">
            Clé API
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="ml-1">
                  <Info className="h-4 w-4 text-primary/60 inline" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>La clé API pour accéder aux services Google Cloud</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </Label>
          <Input
            id="googleApiKey"
            value={config.apiKey}
            onChange={(e) =>
              onConfigChange({ ...config, apiKey: e.target.value })
            }
            className="input-field mt-1"
            placeholder="Entrez votre Google API Key"
            type="password"
          />
        </div>

        <div className="flex flex-col gap-4">
          <Button 
            onClick={onSave}
            className="w-full"
            disabled={!config.clientId || !config.apiKey}
          >
            Sauvegarder la configuration
          </Button>

          <div className="bg-primary/5 p-4 rounded-md">
            <h4 className="text-sm font-medium text-primary mb-2">
              Documentation & Ressources
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Consultez la documentation Google Cloud pour plus d'informations sur la configuration de l'API.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://cloud.google.com/docs', '_blank')}
              className="w-full"
            >
              Accéder à la documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
