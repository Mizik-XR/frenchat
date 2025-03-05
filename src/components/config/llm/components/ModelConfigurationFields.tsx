
import { useState } from "react";
import type { AIModel } from "../types";
import { ApiKeyField } from "./fields/ApiKeyField";
import { ModelNameField } from "./fields/ModelNameField";
import { TemperatureField } from "./fields/TemperatureField";
import { ConfigurationCard } from "./fields/ConfigurationCard";

interface ModelConfigurationFieldsProps {
  model: AIModel;
  onModelUpdate: (model: AIModel) => void;
}

export function ModelConfigurationFields({ model, onModelUpdate }: ModelConfigurationFieldsProps) {
  if (!model.configFields) return null;
  
  // État local pour la clé API
  const [apiKeyState, setApiKeyState] = useState(model.apiKey || '');

  const handleValueChange = (field: string, value: string | number) => {
    const updatedModel = { ...model } as AIModel & Record<string, any>;
    updatedModel[field] = value;
    onModelUpdate(updatedModel);
  };

  return (
    <ConfigurationCard modelName={model.name}>
      {model.configFields.apiKey && (
        <ApiKeyField 
          model={model}
          onValueChange={handleValueChange}
          apiKeyState={apiKeyState}
          setApiKeyState={setApiKeyState}
        />
      )}

      {model.configFields.modelName && (
        <ModelNameField 
          modelId={model.modelId}
          onValueChange={handleValueChange}
        />
      )}

      {model.configFields.temperature && (
        <TemperatureField 
          temperature={model.temperature}
          onValueChange={handleValueChange}
        />
      )}
    </ConfigurationCard>
  );
}
