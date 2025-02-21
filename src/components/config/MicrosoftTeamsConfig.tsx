
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeamsConfig } from "@/types/config";

interface MicrosoftTeamsConfigProps {
  config: TeamsConfig;
  onConfigChange: (config: TeamsConfig) => void;
  onSave: () => void;
}

export const MicrosoftTeamsConfig = ({ config, onConfigChange }: MicrosoftTeamsConfigProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Microsoft Teams</h3>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="microsoftClientId">Client ID</Label>
          <Input
            id="microsoftClientId"
            value={config.clientId}
            onChange={(e) =>
              onConfigChange({ ...config, clientId: e.target.value })
            }
            className="input-field"
            placeholder="Entrez votre Microsoft Client ID"
          />
        </div>
        <div>
          <Label htmlFor="microsoftTenantId">Tenant ID</Label>
          <Input
            id="microsoftTenantId"
            value={config.tenantId}
            onChange={(e) =>
              onConfigChange({ ...config, tenantId: e.target.value })
            }
            className="input-field"
            placeholder="Entrez votre Microsoft Tenant ID"
            type="password"
          />
        </div>
      </div>
    </div>
  );
};
