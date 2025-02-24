import { useState } from "react";
import { AIProvider, WebUIConfig } from "@/types/chat";
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConversations } from '@/hooks/useConversations';
import { useChatLogic } from '@/hooks/useChatLogic';
import { useServiceConfiguration } from '@/hooks/useServiceConfiguration';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { MainLayout } from "./chat/layout/MainLayout";

export const Chat = () => {
  const [input, setInput] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPriorityTopics, setShowPriorityTopics] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

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

  const handleNewConversation = async () => {
    const newConv = await createNewConversation(webUIConfig);
    setSelectedConversationId(newConv.id);
  };

  const handleTopicSelect = (messageId: string) => {
    console.log('Topic selected:', messageId);
  };

  return (
    <MainLayout
      conversations={conversations || []}
      selectedConversationId={selectedConversationId}
      messages={messages}
      isLoading={isLoading}
      llmStatus={llmStatus}
      webUIConfig={webUIConfig}
      input={input}
      selectedDocumentId={selectedDocumentId}
      showSettings={showSettings}
      showUploader={showUploader}
      showPriorityTopics={showPriorityTopics}
      onConversationSelect={setSelectedConversationId}
      onNewConversation={handleNewConversation}
      onUpdateConversation={updateConversation}
      onModeChange={(mode) => setWebUIConfig(prev => ({ ...prev, mode }))}
      onWebUIConfigChange={(config) => setWebUIConfig(prev => ({ ...prev, ...config }))}
      onProviderChange={(provider) => setWebUIConfig(prev => ({ ...prev, model: provider }))}
      setInput={setInput}
      setShowSettings={setShowSettings}
      setShowUploader={setShowUploader}
      setShowPriorityTopics={setShowPriorityTopics}
      onSubmit={handleSubmit}
      onFilesSelected={handleFilesSelected}
      onTopicSelect={handleTopicSelect}
    />
  );
};
