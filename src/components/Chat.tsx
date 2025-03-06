
import { useServiceConfiguration } from '@/hooks/useServiceConfiguration';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useConversations } from '@/hooks/useConversations';
import { useChatLogic } from '@/hooks/useChatLogic';
import { MainLayout } from "./chat/layout/MainLayout";
import { useChatState } from '@/hooks/useChatState';
import { useChatActions } from '@/hooks/useChatActions';
import { useCallback } from 'react';

export const Chat = () => {
  // Custom hooks to manage state and actions
  const {
    input, setInput,
    selectedDocumentId,
    showSettings, setShowSettings,
    showPriorityTopics, setShowPriorityTopics,
    showUploader, setShowUploader,
    selectedConversationId, setSelectedConversationId,
    modelSource, webUIConfig,
    handleModelSourceChange, handleModeChange,
    handleProviderChange, handleWebUIConfigChange
  } = useChatState();

  // Service and data hooks
  const { config: llmConfig, status: llmStatus } = useServiceConfiguration('llm');
  const { messages, clearMessages } = useChatMessages(selectedConversationId);
  const { conversations, createNewConversation, updateConversation } = useConversations();
  const { 
    isLoading, processMessage, handleReplyToMessage, 
    replyToMessage, clearReplyToMessage 
  } = useChatLogic(selectedConversationId);

  // Actions hook
  const { 
    handleSubmit,
    handleResetConversation,
    handleAnalysisModeChange,
    handleFilesSelected
  } = useChatActions(
    selectedConversationId,
    webUIConfig,
    processMessage,
    clearMessages,
    createNewConversation,
    messages
  );

  const handleNewConversation = async () => {
    const newConv = await createNewConversation(webUIConfig);
    setSelectedConversationId(newConv.id);
  };

  const handleTopicSelect = (messageId: string) => {
    console.log('Topic selected:', messageId);
    // Trouver le message et le définir comme message de réponse
    const message = messages.find(m => m.id === messageId);
    if (message) {
      handleReplyToMessage(message);
    }
  };

  // Wrapper function to update the UI config with analysis mode
  const onAnalysisModeChange = (mode: any) => {
    const newMode = handleAnalysisModeChange(mode);
    handleWebUIConfigChange({ analysisMode: newMode });
  };

  // Wrapper for handleSubmit
  const onSubmit = useCallback((e: React.FormEvent) => {
    // Fix argument count: removing replyToMessage from here since it's already 
    // available in the chatLogic hook that handleSubmit uses internally
    handleSubmit(e, input, setInput, selectedDocumentId, llmStatus);
    
    // Effacer le message de réponse après l'envoi
    if (replyToMessage) {
      clearReplyToMessage();
    }
  }, [handleSubmit, input, setInput, selectedDocumentId, llmStatus, replyToMessage, clearReplyToMessage]);

  // Wrapper for file handling
  const onFilesSelected = async (files: File[]) => {
    const success = await handleFilesSelected(files);
    if (success) {
      setShowUploader(false);
    }
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
      onUpdateConversation={updateConversation}
      onModeChange={handleModeChange}
      onWebUIConfigChange={handleWebUIConfigChange}
      onProviderChange={handleProviderChange}
      onReplyToMessage={handleReplyToMessage}
      setInput={setInput}
      setShowSettings={setShowSettings}
      setShowUploader={setShowUploader}
      setShowPriorityTopics={setShowPriorityTopics}
      onSubmit={onSubmit}
      onFilesSelected={onFilesSelected}
      onTopicSelect={handleTopicSelect}
      onResetConversation={handleResetConversation}
      onAnalysisModeChange={onAnalysisModeChange}
      modelSource={modelSource}
      onModelSourceChange={handleModelSourceChange}
    />
  );
};
