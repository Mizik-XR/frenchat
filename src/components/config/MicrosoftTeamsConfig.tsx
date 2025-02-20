
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Credentials } from "../types/config";

interface MicrosoftTeamsConfigProps {
  credentials: Credentials;
  setCredentials: (credentials: Credentials) => void;
}

export const MicrosoftTeamsConfig = ({ credentials, setCredentials }: MicrosoftTeamsConfigProps) => {
  return (
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
  );
};
