
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleConfig } from "@/types/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useGoogleDriveConfig } from "@/hooks/useGoogleDriveConfig";
import { Skeleton } from "@/components/ui/skeleton";

export const GoogleDriveConfig = () => {
  const { config, isLoading, saveConfig } = useGoogleDriveConfig();
  const [localConfig, setLocalConfig] = useState<GoogleConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleGoogleConsoleOpen = () => {
    window.open('https://console.cloud.google.com/apis/credentials', '_blank');
  };

  const handleDocsOpen = () => {
    window.open('https://docs.google.com/document/create', '_blank');
  };

  const handleSave = () => {
    saveConfig(localConfig);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-8 w-[300px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Configuration Google Drive</CardTitle>
        <CardDescription className="text-base">
          Pour permettre l'accès aux documents Google Drive, deux clés sont nécessaires :
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
          <div className="flex items-start">
            <div className="mr-2">ℹ️</div>
            <div>
              <p className="font-medium">Guide rapide :</p>
              <ol className="list-decimal ml-4 mt-2 space-y-1">
                <li>Créez un projet dans la Console Google Cloud</li>
                <li>Activez l'API Google Drive</li>
                <li>Créez un ID Client OAuth 2.0</li>
                <li>Créez une Clé API</li>
              </ol>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="googleClientId" className="text-base">ID Client OAuth 2.0</Label>
                <p className="text-sm text-gray-500">
                  Nécessaire pour l'authentification des utilisateurs
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      L'ID Client OAuth permet aux utilisateurs d'autoriser l'accès à leurs documents Google Drive
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="googleClientId"
              value={localConfig.clientId}
              onChange={(e) => setLocalConfig({ ...localConfig, clientId: e.target.value })}
              className="w-full"
              placeholder="xxx.apps.googleusercontent.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="googleApiKey" className="text-base">Clé API</Label>
                <p className="text-sm text-gray-500">
                  Nécessaire pour les requêtes à l'API Google Drive
                </p>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      La clé API permet d'effectuer des recherches et d'indexer les documents
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="googleApiKey"
              value={localConfig.apiKey}
              onChange={(e) => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
              className="w-full"
              placeholder="AIza..."
              type="password"
            />
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-4">
          <h3 className="text-sm font-medium">Liens utiles</h3>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              onClick={handleGoogleConsoleOpen}
              className="w-full justify-between"
            >
              <span>Console Google Cloud</span>
              <ExternalLink className="h-4 w-4" />
            </Button>

            <Button 
              variant="outline"
              onClick={handleDocsOpen}
              className="w-full justify-between"
            >
              <span>Tester avec un Document Google</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          className="w-full" 
          disabled={!localConfig.clientId || !localConfig.apiKey}
        >
          Sauvegarder la configuration
        </Button>
      </CardContent>
    </Card>
  );
};
