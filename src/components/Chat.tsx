
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
import { PriorityTopicsPanel } from "./chat/PriorityTopicsPanel";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, AlertTriangle, Bot, FileUp, Settings } from "lucide-react";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (llmStatus !== 'configured') {
      toast({
        title: "Configuration requise",
        description: "Veuillez configurer un modèle de langage dans les paramètres",
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
        
        <div className="flex-1 flex">
          <div className="flex-1 relative">
            <Card className="h-full flex flex-col bg-white shadow-sm">
              <div className="flex justify-between items-center p-4 border-b">
                <ChatHeader 
                  mode={webUIConfig.mode}
                  onModeChange={(mode) => setWebUIConfig(prev => ({ ...prev, mode }))}
                />
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                    className="hover:bg-gray-100"
                    title="Paramètres"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPriorityTopics(!showPriorityTopics)}
                    className={`hover:bg-gray-100 ${showPriorityTopics ? 'text-blue-600' : ''}`}
                    title="Sujets Prioritaires"
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </Button>
                </div>
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
                    onWebUIConfigChange={(config) => setWebUIConfig(prev => ({ ...prev, ...config }))}
                    onProviderChange={(provider) => setWebUIConfig(prev => ({ ...prev, model: provider }))}
                  />
                </div>
              )}

              <div className="flex-1 overflow-hidden">
                <MessageList 
                  messages={messages} 
                  isLoading={isLoading}
                />
              </div>

              {showUploader && (
                <div className="p-4 bg-white border-t">
                  <FileUploader 
                    onFilesSelected={handleFilesSelected}
                    description="Les fichiers seront automatiquement indexés"
                  />
                </div>
              )}

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowUploader(!showUploader)}
                    className="hover:bg-gray-100"
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
              </div>
            </Card>
          </div>

          {showPriorityTopics && (
            <div className="w-80 border-l border-gray-200 bg-white animate-slide-in-right">
              <PriorityTopicsPanel
                messages={messages}
                onClose={() => setShowPriorityTopics(false)}
                onQuote={setInput}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
