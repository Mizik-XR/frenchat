
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Settings, Save } from "lucide-react";

export interface Credentials {
  googleClientId: string;
  googleApiKey: string;
  microsoftClientId: string;
  microsoftTenantId: string;
}

export const ConfigLayout = () => {
  const [credentials, setCredentials] = useState<Credentials>({
    googleClientId: "",
    googleApiKey: "",
    microsoftClientId: "",
    microsoftTenantId: "",
  });

  const handleSave = async () => {
    try {
      // TODO: Implement Supabase integration for saving credentials
      toast({
        title: "Success",
        description: "Credentials saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save credentials",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 slide-up">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">
            Configuration
          </h2>
          <p className="mt-2 text-gray-600">
            Enter your API credentials to connect with Google Drive and Microsoft Teams
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
                  placeholder="Enter Google Client ID"
                />
              </div>
              <div>
                <Label htmlFor="googleApiKey">API Key</Label>
                <Input
                  id="googleApiKey"
                  value={credentials.googleApiKey}
                  onChange={(e) =>
                    setCredentials({ ...credentials, googleApiKey: e.target.value })
                  }
                  className="input-field"
                  placeholder="Enter Google API Key"
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
                  placeholder="Enter Microsoft Client ID"
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
                  placeholder="Enter Microsoft Tenant ID"
                  type="password"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="hover-scale"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Credentials
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
