import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { AIProvider, WebUIConfig } from "@/types/chat";
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConversations } from '@/hooks/useConversations';
import { useChatLogic } from '@/hooks/useChatLogic';
import { ChatHeader } from "./chat/ChatHeader";
import { ChatInput } from "./chat/ChatInput";
import { SettingsPanel } from "./chat/SettingsPanel";
import { MessageList } from "./chat/MessageList";
import { ConversationList } from "./chat/ConversationList";
import { ConversationExport } from "./chat/ConversationExport";
import { PriorityTopicsPanel } from "./chat/PriorityTopicsPanel";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, AlertCircle, Bot, FileUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useServiceConfiguration } from '@/hooks/useServiceConfiguration';
import { FileUploader } from "@/components/config/ImportMethod/FileUploader";
import { supabase } from "@/integrations/supabase/client";

export const Chat = () => {
  const [input, setInput] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPriorityTopics, setShowPriorityTopics] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);

  const [webUIConfig, setWebUIConfig] = useState<WebUIConfig>({
    mode: 'auto',
    model: 'huggingface',
    maxTokens: 2000,
    temperature: 0.7,
    streamResponse: true
  });

  const { config: llmConfig, status: llmStatus } = useServiceConfiguration('llm');
  const { messages } = useChatMessages(selectedConversationId);
  const { conversations, createNewConversation, updateConversation } = useConversations();
  const { isLoading, processMessage } = useChatLogic(selectedConversationId);

  const handleProviderChange = (provider: AIProvider) => {
    setWebUIConfig(prev => ({ ...prev, model: provider }));
  };

  const handleWebUIConfigChange = (config: Partial<WebUIConfig>) => {
    setWebUIConfig(prev => ({ ...prev, ...config }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (llmStatus !== 'configured') {
      toast({
        title: "Configuration requise",
        description: "Veuillez configurer un modèle de langage avant de poser une question.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (!selectedConversationId) {
        const newConv = await createNewConversation(webUIConfig);
        setSelectedConversationId(newConv.id);
      }

      const message = input;
      setInput('');
      await processMessage(message, webUIConfig, selectedDocumentId);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleQuote = (content: string) => {
    setInput(content);
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = document.getElementById(messageId);
    if (messageElement && messageListRef.current) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      messageElement.classList.add('highlight-message');
      setTimeout(() => messageElement.classList.remove('highlight-message'), 2000);
    }
  };

  useEffect(() => {
    if (conversations?.length) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations]);

  const handleFilesSelected = async (files: File[]) => {
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        
        await supabase.functions.invoke('upload-chat-file', {
          body: formData
        });

        toast({
          title: "Fichier ajouté",
          description: `${file.name} a été uploadé avec succès`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur d'upload",
        description: "Une erreur est survenue lors de l'upload du fichier",
        variant: "destructive"
      });
    } finally {
      setShowUploader(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        <ConversationList
          conversations={conversations || []}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          onNew={() => createNewConversation(webUIConfig)}
          onUpdateConversation={updateConversation}
        />
        
        <div className="flex-1 p-4 flex">
          <Card className="flex flex-col h-full p-4 relative bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 shadow-lg flex-1">
            {llmStatus !== 'configured' && (
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Veuillez configurer un modèle de langage dans les paramètres pour pouvoir utiliser le chat.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between items-center">
              <ChatHeader 
                mode={webUIConfig.mode}
                onModeChange={(mode) => handleWebUIConfigChange({ mode })}
                onToggleSettings={() => setShowSettings(!showSettings)} 
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPriorityTopics(!showPriorityTopics)}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Sujets Prioritaires
                </Button>
                {messages.length > 0 && (
                  <ConversationExport
                    messages={messages}
                    title={conversations?.find(c => c.id === selectedConversationId)?.title || ""}
                  />
                )}
              </div>
            </div>

            {showSettings && (
              <SettingsPanel
                webUIConfig={webUIConfig}
                onWebUIConfigChange={handleWebUIConfigChange}
                onProviderChange={handleProviderChange}
              />
            )}

            <div className="flex-1 overflow-y-auto mb-4 bg-white/60 rounded-lg p-4" ref={messageListRef}>
              <MessageList 
                messages={messages} 
                isLoading={isLoading}
              />
            </div>

            {showUploader && (
              <div className="p-4 bg-white rounded-lg shadow-sm mb-4 border border-gray-200">
                <FileUploader 
                  onFilesSelected={handleFilesSelected}
                  description="Les fichiers seront automatiquement indexés et disponibles pour l'analyse"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowUploader(!showUploader)}
                className="hover:bg-blue-50"
                title="Ajouter un fichier"
              >
                <FileUp className="h-4 w-4" />
              </Button>

              <ChatInput
                input={input}
                setInput={setInput}
                isLoading={isLoading}
                selectedDocumentId={selectedDocumentId}
                onSubmit={handleSubmit}
                mode={webUIConfig.mode}
                model={webUIConfig.model}
              />
            </div>
          </Card>

          {showPriorityTopics && (
            <PriorityTopicsPanel
              messages={messages}
              onTopicSelect={scrollToMessage}
              onClose={() => setShowPriorityTopics(false)}
              onQuote={handleQuote}
            />
          )}
        </div>
      </div>
    </div>
  );
};
