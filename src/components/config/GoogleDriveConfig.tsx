
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoogleConfig } from "@/types/config";

interface GoogleDriveConfigProps {
  config: GoogleConfig;
  onConfigChange: (config: GoogleConfig) => void;
  onSave: () => void;
}

export const GoogleDriveConfig = ({ config, onConfigChange }: GoogleDriveConfigProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Google Drive</h3>
      <div className="grid gap-4">
        <div>
          <Label htmlFor="googleClientId">Client ID</Label>
          <Input
            id="googleClientId"
            value={config.clientId}
            onChange={(e) =>
              onConfigChange({ ...config, clientId: e.target.value })
            }
            className="input-field"
            placeholder="Entrez votre Google Client ID"
          />
        </div>
        <div>
          <Label htmlFor="googleApiKey">Clé API</Label>
          <Input
            id="googleApiKey"
            value={config.apiKey}
            onChange={(e) =>
              onConfigChange({ ...config, apiKey: e.target.value })
            }
            className="input-field"
            placeholder="Entrez votre Google API Key"
            type="password"
          />
        </div>
      </div>
    </div>
  );
};
