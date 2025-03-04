
import { Card } from "@/components/ui/card";
import { ChatHeader } from "../ChatHeader";
import { MessageList } from "../MessageList";
import { ChatInputContainer } from "./ChatInputContainer";
import { SettingsPanel } from "../SettingsPanel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Message, WebUIConfig, AIProvider, AnalysisMode } from "@/types/chat";
import { NavigationControls } from "@/components/navigation/NavigationControls";
import { useState } from "react";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  llmStatus: string;
  webUIConfig: WebUIConfig;
  input: string;
  selectedDocumentId: string | null;
  showSettings: boolean;
  showUploader: boolean;
  replyToMessage: Message | null;
  onClearReply: () => void;
  onModeChange: (mode: 'auto' | 'manual') => void;
  onWebUIConfigChange: (config: Partial<WebUIConfig>) => void;
  onProviderChange: (provider: AIProvider) => void;
  onReplyToMessage: (message: Message) => void;
  setInput: (input: string) => void;
  setShowSettings: (show: boolean) => void;
  setShowUploader: (show: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onFilesSelected: (files: File[]) => Promise<void>;
  onResetConversation: () => void;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
}

export const ChatContainer = ({
  messages,
  isLoading,
  llmStatus,
  webUIConfig,
  input,
  selectedDocumentId,
  showSettings,
  showUploader,
  replyToMessage,
  onClearReply,
  onModeChange,
  onWebUIConfigChange,
  onProviderChange,
  onReplyToMessage,
  setInput,
  setShowSettings,
  setShowUploader,
  onSubmit,
  onFilesSelected,
  onResetConversation,
  onAnalysisModeChange
}: ChatContainerProps) => {
  const [modelSource, setModelSource] = useState<'cloud' | 'local'>('cloud');

  const handleModelSourceChange = (source: 'cloud' | 'local') => {
    setModelSource(source);
    // Update available models based on source
    if (source === 'cloud') {
      // Set to default cloud model
      onProviderChange('huggingface');
    } else {
      // Set to default local model
      onProviderChange('huggingface'); // Start with default, this can be enhanced to select best local model
    }
  };

  return (
    <Card className="h-full flex flex-col bg-white dark:bg-gray-800 shadow-sm">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700">
        <NavigationControls />
        <ChatHeader 
          mode={webUIConfig.mode}
          onModeChange={onModeChange}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          onResetConversation={onResetConversation}
          setShowUploader={setShowUploader}
          modelSource={modelSource}
          onModelSourceChange={handleModelSourceChange}
        />
      </div>

      {llmStatus !== 'configured' && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Veuillez configurer un modèle de langage dans les paramètres pour utiliser le chat.
          </AlertDescription>
        </Alert>
      )}

      {showSettings && (
        <div className="absolute top-16 right-4 z-50 w-80">
          <SettingsPanel
            webUIConfig={webUIConfig}
            onWebUIConfigChange={onWebUIConfigChange}
            onProviderChange={onProviderChange}
            onAnalysisModeChange={onAnalysisModeChange}
            modelSource={modelSource}
          />
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <MessageList 
          messages={messages} 
          isLoading={isLoading}
        />
      </div>

      <ChatInputContainer
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        selectedDocumentId={selectedDocumentId}
        onSubmit={onSubmit}
        mode={webUIConfig.mode}
        model={webUIConfig.model}
        showUploader={showUploader}
        setShowUploader={setShowUploader}
        onFilesSelected={onFilesSelected}
        modelSource={modelSource}
      />
    </Card>
  );
};
