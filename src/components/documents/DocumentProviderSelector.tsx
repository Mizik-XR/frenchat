
import React from "react";
import { useAuth } from "@/components/AuthProvider";
import { useDocumentProviders } from "@/hooks/useDocumentProviders";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { FileText, Cloud, Upload } from "lucide-react";

const providerIcons: Record<string, React.ComponentType> = {
  google_drive: Cloud,
  microsoft_teams: FileText,
  local_upload: Upload,
  microsoft_onedrive: Cloud,
  dropbox: Cloud,
};

export function DocumentProviderSelector() {
  const { user } = useAuth();
  const { providers, isProviderConnected, isLoading } = useDocumentProviders(user?.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Icons.spinner className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {providers.map((provider) => {
        const Icon = providerIcons[provider.provider_code] || FileText;
        const isConnected = isProviderConnected(provider.provider_code);

        return (
          <Card key={provider.provider_code} className="relative">
            {isConnected && (
              <div className="absolute top-2 right-2">
                <Icons.check className="h-5 w-5 text-green-500" />
              </div>
            )}
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon className="h-5 w-5" />
                {provider.name}
              </CardTitle>
              <CardDescription>{provider.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant={isConnected ? "secondary" : "default"}
                className="w-full"
                onClick={() => {
                  // La logique de connexion sera implémentée pour chaque provider
                  console.log(`Connecting to ${provider.name}`);
                }}
              >
                {isConnected ? "Configuré" : "Connecter"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
