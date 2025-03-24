
import React from '@/core/reactInstance';
import { Label } from "@/components/ui/label";
import { ServiceType } from "@/types/config";
import { APIKeyField } from "./APIKeyField";

interface ProviderInfo {
  name: string;
  description: string;
  placeholder: string;
}

interface ProviderConfigCardProps {
  provider: string;
  info: ProviderInfo;
  apiKey: string;
  isSubmitting: boolean;
  onApiKeyChange: (value: string) => void;
  onSaveConfig: (provider: ServiceType, apiKey: string) => void;
}

export const ProviderConfigCard = ({
  provider,
  info,
  apiKey,
  isSubmitting,
  onApiKeyChange,
  onSaveConfig
}: ProviderConfigCardProps) => {
  return (
    <div key={provider} className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-semibold">{info.name}</Label>
        {apiKey && (
          <span className="text-sm text-green-600 font-medium">
            Configuré ✓
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-2">{info.description}</p>
      <APIKeyField
        provider={provider}
        apiKey={apiKey}
        placeholder={info.placeholder}
        isSubmitting={isSubmitting}
        onApiKeyChange={(value) => onApiKeyChange(value)}
        onSave={() => onSaveConfig(provider as ServiceType, apiKey)}
      />
    </div>
  );
};
