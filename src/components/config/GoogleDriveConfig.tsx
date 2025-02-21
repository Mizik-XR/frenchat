
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleConfig } from "@/types/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GoogleDriveConfigProps {
  config: GoogleConfig;
  onConfigChange: (config: GoogleConfig) => void;
  onSave: () => void;
}

export const GoogleDriveConfig = ({ config, onConfigChange, onSave }: GoogleDriveConfigProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuration Google Drive</CardTitle>
        <CardDescription>
          Configurez l'accès à Google Drive pour indexer et rechercher vos documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="googleClientId">Client ID</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>L'identifiant client OAuth 2.0 de votre application Google Cloud</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="googleClientId"
              value={config.clientId}
              onChange={(e) => onConfigChange({ ...config, clientId: e.target.value })}
              className="w-full"
              placeholder="Entrez votre Google Client ID"
            />
            <p className="text-sm text-gray-500">
              Trouvable dans la console Google Cloud Platform sous "Identifiants OAuth 2.0".
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="googleApiKey">Clé API</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>La clé API pour accéder aux services Google Cloud</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="googleApiKey"
              value={config.apiKey}
              onChange={(e) => onConfigChange({ ...config, apiKey: e.target.value })}
              className="w-full"
              placeholder="Entrez votre Google API Key"
              type="password"
            />
            <p className="text-sm text-gray-500">
              Générable dans la console Google Cloud Platform sous "Identifiants".
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button onClick={onSave} className="w-full sm:w-auto self-end">
            Sauvegarder la configuration
          </Button>

          <div className="bg-primary/5 p-4 rounded-md">
            <h4 className="text-sm font-medium text-primary mb-2">
              Documentation & Ressources
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Pour obtenir vos identifiants, rendez-vous sur la Console Google Cloud et activez l'API Google Drive.
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://console.cloud.google.com/apis/credentials', '_blank')}
              className="w-full"
            >
              Accéder à la console Google Cloud
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
