
import { useState } from "react";
import { ModelSelector } from "./ModelSelector";
import { LocalAIConfig } from "./LocalAIConfig";

interface LLMConfigProps {
  defaultType?: 'local' | 'api';
}

export function LLMConfig({ defaultType = 'api' }: LLMConfigProps) {
  const [selectedType, setSelectedType] = useState<'local' | 'api'>(defaultType);

  return (
    <div className="space-y-8">
      <ModelSelector 
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />
      
      {selectedType === 'local' && <LocalAIConfig />}
    </div>
  );
}
