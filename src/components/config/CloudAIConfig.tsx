
import React from '@/core/reactInstance';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ServiceType } from "@/types/config";
import { ProviderConfigCard } from "./cloudai/ProviderConfigCard";
import { OnlineAlert } from "./cloudai/OnlineAlert";
import { OfflineAlert } from "./cloudai/OfflineAlert";
import { providerInfo } from "./cloudai/providerData";
import { useCloudAIConfig } from "./cloudai/useCloudAIConfig";

export const CloudAIConfig = () => {
  const navigate = useNavigate();
  const { 
    configs, 
    isSubmitting, 
    loadError, 
    handleApiKeyChange, 
    handleSaveConfig 
  } = useCloudAIConfig();

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/config")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Configuration des Modèles d'IA Cloud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loadError ? (
            <OfflineAlert errorMessage={loadError} />
          ) : (
            <OnlineAlert />
          )}

          {Object.entries(providerInfo).map(([provider, info]) => (
            <ProviderConfigCard
              key={provider}
              provider={provider}
              info={info}
              apiKey={configs[provider] || ''}
              isSubmitting={isSubmitting[provider] || false}
              onApiKeyChange={(value) => handleApiKeyChange(provider, value)}
              onSaveConfig={handleSaveConfig}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
