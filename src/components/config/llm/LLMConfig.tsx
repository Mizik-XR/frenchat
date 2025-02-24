
import { useState } from "react";
import { ModelSelector } from "./ModelSelector";
import { LocalAIConfig } from "./LocalAIConfig";

interface LLMConfigProps {
  defaultType?: 'local' | 'api';
  onSave?: () => void;  // Ajout de la prop onSave optionnelle
}

export function LLMConfig({ defaultType = 'api', onSave }: LLMConfigProps) {
  const [selectedType, setSelectedType] = useState<'local' | 'api'>(defaultType);

  const handleTypeChange = (type: 'local' | 'api') => {
    setSelectedType(type);
    if (onSave) {
      onSave();
    }
  };

  return (
    <div className="space-y-8">
      <ModelSelector 
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
      />
      
      {selectedType === 'local' && <LocalAIConfig />}
    </div>
  );
}
