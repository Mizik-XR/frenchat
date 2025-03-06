
import React, { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { MessageInputContainer } from "@/components/chat/input/MessageInputContainer";
import { Home, ArrowLeft, ArrowRight, RefreshCw, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThreeStateToggle } from "@/components/ui/ThreeStateToggle";
import { SettingsDialog } from "@/components/chat/settings/SettingsDialog";
import { ModelSelector } from "@/components/chat/input/ModelSelector";
import { Message, WebUIConfig, AIProvider, AnalysisMode } from "@/types/chat";
import { StatusIndicator } from "@/components/chat/input/StatusIndicator";

interface MainChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  webUIConfig: WebUIConfig;
  selectedConversationId: string | null;
  input: string;
  setInput: (input: string) => void;
  replyToMessage: Message | null;
  onClearReply: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onReplyToMessage: (message: Message) => void;
  onResetConversation: () => void;
  modelSource: 'cloud' | 'local';
  onModelSourceChange: (source: 'cloud' | 'local') => void;
  onModeChange: (mode: 'auto' | 'manual') => void;
  onWebUIConfigChange: (config: Partial<WebUIConfig>) => void;
  onProviderChange: (provider: AIProvider) => void;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
  onFilesSelected: (files: File[]) => Promise<void>;
  llmStatus: string;
}

export function MainChatContainer({
  messages,
  isLoading,
  webUIConfig,
  selectedConversationId,
  input,
  setInput,
  replyToMessage,
  onClearReply,
  onSubmit,
  onReplyToMessage,
  onResetConversation,
  modelSource,
  onModelSourceChange,
  onModeChange,
  onWebUIConfigChange,
  onProviderChange,
  onAnalysisModeChange,
  onFilesSelected,
  llmStatus
}: MainChatContainerProps) {
  const [autoMode, setAutoMode] = useState(webUIConfig.mode === 'auto');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e);
  };

  const handleForwardMessage = (message: Message) => {
    setInput(message.content);
    toast({
      title: "Message transféré",
      description: "Le contenu du message a été copié dans la zone de texte",
    });
  };

  const handleQuoteMessage = (message: Message) => {
    setInput(`> ${message.content}\n\n`);
  };

  const handleAttachment = (type: string) => {
    // Cette fonction sera connectée aux fonctionnalités existantes
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.onchange = async (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        const files = Array.from(target.files);
        await onFilesSelected(files);
      }
    };
    fileInput.click();
  };

  const renderIAModeToggle = () => {
    return (
      <ThreeStateToggle
        options={[
          { value: "cloud", label: "IA Cloud" },
          { value: "auto", label: "Auto" },
          { value: "local", label: "IA Local" },
        ]}
        value={autoMode ? "auto" : modelSource}
        onValueChange={(value) => {
          if (value === "auto") {
            setAutoMode(true);
            onModeChange("auto");
          } else {
            setAutoMode(false);
            onModeChange("manual");
            onModelSourceChange(value as 'cloud' | 'local');
          }
        }}
      />
    );
  };

  if (!selectedConversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Bienvenue sur Frenchat</h2>
          <p className="text-muted-foreground mb-6">
            Posez vos questions ou téléchargez des documents pour commencer une conversation.
          </p>
          <Button className="bg-french-blue hover:bg-french-blue/90" onClick={() => {}}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle conversation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {renderIAModeToggle()}
          <Button variant="outline" onClick={onResetConversation}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          <SettingsDialog 
            webUIConfig={webUIConfig}
            onWebUIConfigChange={onWebUIConfigChange}
            onProviderChange={onProviderChange}
            onAnalysisModeChange={onAnalysisModeChange}
            modelSource={modelSource}
            onModelSourceChange={onModelSourceChange}
            onModeChange={onModeChange}
            autoMode={autoMode}
            setAutoMode={setAutoMode}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center p-8">
              <p className="text-muted-foreground">Aucun message dans cette conversation. Commencez à discuter !</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <ChatMessage
                key={message.id || index}
                message={message}
                messages={messages}
                onReply={() => onReplyToMessage(message)}
                onForward={() => handleForwardMessage(message)}
                onQuote={() => handleQuoteMessage(message)}
                isCurrentUser={message.role === 'user'}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <MessageInputContainer
        inputValue={input}
        setInputValue={setInput}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        replyToMessage={replyToMessage}
        onCancelReply={onClearReply}
        onAttachment={handleAttachment}
      />

      <div className="flex justify-between items-center px-4 py-2 text-xs text-muted-foreground">
        <StatusIndicator 
          serviceType={modelSource === 'local' ? 'local' : 'cloud'}
          mode={webUIConfig.mode}
          model={webUIConfig.model}
          modelSource={modelSource}
        />
        {!autoMode && (
          <ModelSelector 
            selectedModel={webUIConfig.model} 
            onSelectModel={(model) => onProviderChange(model as AIProvider)}
            modelSource={modelSource}
          />
        )}
      </div>
    </div>
  );
}
