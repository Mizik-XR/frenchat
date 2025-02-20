
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Credentials } from "@/types/config";

interface GoogleDriveConfigProps {
  credentials: Credentials;
  setCredentials: (credentials: Credentials) => void;
}

export const GoogleDriveConfig = ({ credentials, setCredentials }: GoogleDriveConfigProps) => {
  return (
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
  );
};
