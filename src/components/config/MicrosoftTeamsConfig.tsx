
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamsConfig } from "@/types/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MicrosoftTeamsConfigProps {
  config: TeamsConfig;
  onConfigChange: (config: TeamsConfig) => void;
  onSave: () => void;
}

export const MicrosoftTeamsConfig = ({ config, onConfigChange, onSave }: MicrosoftTeamsConfigProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Microsoft Teams</CardTitle>
        <CardDescription>
          Configurez l'accès à Microsoft Teams pour indexer et rechercher vos documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="microsoftClientId">Client ID</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Trouvez votre Client ID dans le portail Azure AD sous App Registrations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="microsoftClientId"
              value={config.clientId}
              onChange={(e) => onConfigChange({ ...config, clientId: e.target.value })}
              className="w-full"
              placeholder="Entrez votre Microsoft Client ID"
            />
            <p className="text-sm text-gray-500">
              Le Client ID se trouve dans votre portail Azure AD sous App Registrations.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="microsoftTenantId">Tenant ID</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Le Tenant ID se trouve dans les propriétés de votre Azure AD</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="microsoftTenantId"
              value={config.tenantId}
              onChange={(e) => onConfigChange({ ...config, tenantId: e.target.value })}
              className="w-full"
              placeholder="Entrez votre Microsoft Tenant ID"
              type="password"
            />
            <p className="text-sm text-gray-500">
              Le Tenant ID est disponible dans les propriétés de votre Azure Active Directory.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} className="w-full sm:w-auto">
            Sauvegarder la configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
