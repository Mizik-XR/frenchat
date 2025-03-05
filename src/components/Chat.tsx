
import { useState, useEffect } from "react";
import { AIProvider, WebUIConfig, AnalysisMode, Message } from "@/types/chat";
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

  const { config: llmConfig, status: llmStatus } = useServiceConfiguration('llm');
  const { messages, clearMessages } = useChatMessages(selectedConversationId);
  const { conversations, createNewConversation, updateConversation } = useConversations();
  const { isLoading, processMessage, handleReplyToMessage, replyToMessage, clearReplyToMessage, serviceType } = useChatLogic(selectedConversationId);

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

      const conversationContext = webUIConfig.useMemory 
        ? messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')
        : '';

      const message = input;
      setInput('');
      
      await processMessage(
        message, 
        webUIConfig,
        selectedDocumentId,
        conversationContext
      );
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleResetConversation = () => {
    clearMessages();
    setSelectedConversationId(null);
    toast({
      title: "Conversation réinitialisée",
      description: "L'historique a été effacé",
    });
  };

  const handleAnalysisModeChange = (mode: AnalysisMode) => {
    setWebUIConfig(prev => ({ ...prev, analysisMode: mode }));
    toast({
      title: "Mode d'analyse modifié",
      description: `Mode ${mode} activé`,
    });
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

  const handleProviderChange = (provider: AIProvider) => {
    setWebUIConfig(prev => ({ ...prev, model: provider }));
    toast({
      title: "Modèle sélectionné",
      description: `Vous utilisez maintenant ${provider}`,
    });
  };

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

  // Adapt the updateConversation function to match the expected signature in MainLayout
  const handleUpdateConversation = (params: { 
    id: string; 
    title?: string; 
    folderId?: string | null;
    isPinned?: boolean;
    isArchived?: boolean;
  }) => {
    updateConversation(params);
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
      replyToMessage={replyToMessage}
      onClearReply={clearReplyToMessage}
      onConversationSelect={setSelectedConversationId}
      onNewConversation={handleNewConversation}
      onUpdateConversation={handleUpdateConversation}
      onModeChange={handleModeChange}
      onWebUIConfigChange={(config) => setWebUIConfig(prev => ({ ...prev, ...config }))}
      onProviderChange={handleProviderChange}
      onReplyToMessage={handleReplyToMessage}
      setInput={setInput}
      setShowSettings={setShowSettings}
      setShowUploader={setShowUploader}
      setShowPriorityTopics={setShowPriorityTopics}
      onSubmit={handleSubmit}
      onFilesSelected={handleFilesSelected}
      onTopicSelect={handleTopicSelect}
      onResetConversation={handleResetConversation}
      onAnalysisModeChange={handleAnalysisModeChange}
      modelSource={modelSource}
      onModelSourceChange={handleModelSourceChange}
    />
  );
};
