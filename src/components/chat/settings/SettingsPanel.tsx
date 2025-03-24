
import { Card } from "@/components/ui/card";
import { useState, useEffect  } from '@/core/reactInstance';
import { AIProvider, WebUIConfig, AnalysisMode } from "@/types/chat";
import { AutoModeToggle } from "./AutoModeToggle";
import { ModelSourceSelector } from "./ModelSourceSelector";
import { ModelConfigurator } from "./ModelConfigurator";

interface SettingsPanelProps {
  webUIConfig: WebUIConfig;
  onWebUIConfigChange: (config: Partial<WebUIConfig>) => void;
  onProviderChange: (provider: AIProvider) => void;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
  modelSource: 'cloud' | 'local';
  onModelSourceChange: (source: 'cloud' | 'local') => void;
  onModeChange?: (mode: "auto" | "manual") => void;
}

export const SettingsPanel = ({
  webUIConfig,
  onWebUIConfigChange,
  onProviderChange,
  onAnalysisModeChange,
  modelSource,
  onModelSourceChange,
  onModeChange
}: SettingsPanelProps) => {
  const [autoMode, setAutoMode] = useState(localStorage.getItem('aiServiceType') === 'hybrid');

  const handleAutoModeChange = (isEnabled: boolean) => {
    setAutoMode(isEnabled);
    
    // Save to localStorage
    localStorage.setItem('aiServiceType', isEnabled ? 'hybrid' : modelSource);
    
    // Notify parent
    if (onModeChange) {
      onModeChange(isEnabled ? "auto" : "manual");
    }
  };

  return (
    <Card className="p-4 space-y-6 shadow-lg">
      <AutoModeToggle 
        isAutoMode={autoMode} 
        onAutoModeChange={handleAutoModeChange} 
      />

      {!autoMode && (
        <ModelSourceSelector 
          modelSource={modelSource} 
          onModelSourceChange={onModelSourceChange} 
        />
      )}

      <ModelConfigurator 
        webUIConfig={webUIConfig}
        onWebUIConfigChange={onWebUIConfigChange}
        onProviderChange={onProviderChange}
        onAnalysisModeChange={onAnalysisModeChange}
        modelSource={modelSource}
        isAutoMode={autoMode}
      />
    </Card>
  );
};
