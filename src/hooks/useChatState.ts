
import { useState, useEffect } from "react";
import { WebUIConfig, AIProvider, AnalysisMode } from "@/types/chat";
import { toast } from "@/hooks/use-toast";

export function useChatState() {
  const [input, setInput] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPriorityTopics, setShowPriorityTopics] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [modelSource, setModelSource] = useState<'cloud' | 'local'>(
    localStorage.getItem('aiServiceType') === 'cloud' ? 'cloud' : 'local'
  );
  const [operationMode, setOperationMode] = useState<'auto' | 'manual'>(
    localStorage.getItem('aiServiceType') === 'hybrid' ? 'auto' : 'manual'
  );

  const [webUIConfig, setWebUIConfig] = useState<WebUIConfig>({
    mode: operationMode === 'auto' ? 'auto' : 'manual',
    model: modelSource === 'cloud' ? 'huggingface' : 'mistral',
    maxTokens: 2000,
    temperature: 0.7,
    streamResponse: true,
    analysisMode: 'default',
    useMemory: true
  });

  // Update the webUIConfig when operation mode changes
  useEffect(() => {
    setWebUIConfig(prev => ({
      ...prev,
      mode: operationMode === 'auto' ? 'auto' : 'manual'
    }));
  }, [operationMode]);

  // Update localStorage when modelSource changes
  useEffect(() => {
    if (operationMode !== 'auto') {
      localStorage.setItem('aiServiceType', modelSource);
    }
  }, [modelSource, operationMode]);

  const handleModelSourceChange = (source: 'cloud' | 'local') => {
    setModelSource(source);
    // Adjust model based on source
    const defaultModel = source === 'cloud' ? 'huggingface' : 'mistral';
    setWebUIConfig(prev => ({ ...prev, model: defaultModel }));
    
    // Don't update localStorage if in auto mode
    if (operationMode !== 'auto') {
      localStorage.setItem('aiServiceType', source);
    }
    
    toast({
      title: "Mode modifié",
      description: `Mode ${source === 'cloud' ? 'Cloud' : 'Local'} activé`,
    });
  };

  const handleModeChange = (mode: 'auto' | 'manual') => {
    setOperationMode(mode);
    
    if (mode === 'auto') {
      localStorage.setItem('aiServiceType', 'hybrid');
      toast({
        title: "Mode automatique activé",
        description: "L'IA alternera intelligemment entre modèles locaux et cloud selon vos requêtes",
      });
    } else {
      localStorage.setItem('aiServiceType', modelSource);
      toast({
        title: "Mode manuel activé",
        description: `Vous utilisez uniquement le mode ${modelSource === 'cloud' ? 'Cloud' : 'Local'}`,
      });
    }
  };

  const handleProviderChange = (provider: AIProvider) => {
    setWebUIConfig(prev => ({ ...prev, model: provider }));
    toast({
      title: "Modèle sélectionné",
      description: `Vous utilisez maintenant ${provider}`,
    });
  };

  const handleWebUIConfigChange = (config: Partial<WebUIConfig>) => {
    setWebUIConfig(prev => ({ ...prev, ...config }));
  };

  return {
    input,
    setInput,
    selectedDocumentId,
    setSelectedDocumentId,
    showSettings,
    setShowSettings,
    showPriorityTopics,
    setShowPriorityTopics,
    showUploader,
    setShowUploader,
    selectedConversationId,
    setSelectedConversationId,
    modelSource,
    setModelSource,
    operationMode,
    setOperationMode,
    webUIConfig,
    setWebUIConfig,
    handleModelSourceChange,
    handleModeChange,
    handleProviderChange,
    handleWebUIConfigChange
  };
}
