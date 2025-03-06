
import { ConversationSidebar } from "../ConversationSidebar";
import { MainChatContainer } from "./MainChatContainer";
import { PriorityTopicsPanel } from "../PriorityTopicsPanel";
import { FrenchTitle } from "@/components/ui/FrenchTitle";
import { useState, useEffect } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useChatState } from "@/hooks/useChatState";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatActions } from "@/hooks/useChatActions";
import { useChatLogic } from "@/hooks/useChatLogic";
import { Message } from "@/types/chat";

export const MainLayout = () => {
  const {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    createNewConversation,
    updateConversation
  } = useConversations();

  const {
    input,
    setInput,
    selectedDocumentId,
    showSettings,
    setShowSettings,
    showPriorityTopics,
    setShowPriorityTopics,
    showUploader,
    setShowUploader,
    webUIConfig,
    modelSource,
    operationMode,
    handleModelSourceChange,
    handleModeChange,
    handleProviderChange,
    handleWebUIConfigChange
  } = useChatState();

  const {
    messages,
    isLoading: messagesLoading,
    clearMessages,
    addUserMessage,
    setAssistantResponse
  } = useChatMessages(selectedConversationId);

  const {
    isLoading: processingLoading,
    replyToMessage,
    processMessage,
    handleReplyToMessage,
    clearReplyToMessage,
    serviceType,
    localAIUrl
  } = useChatLogic(selectedConversationId);

  const {
    isProcessing,
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

  const isLoading = messagesLoading || processingLoading || isProcessing;
  const llmStatus = serviceType === 'configured' ? 'configured' : 'not_configured';

  return (
    <div className="flex h-full">
      <ConversationSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onConversationSelect={setSelectedConversationId}
        onNewConversation={createNewConversation}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-center h-14 border-b relative">
          <FrenchTitle />
        </div>
        
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 h-full relative max-h-full">
            <MainChatContainer
              messages={messages}
              isLoading={isLoading}
              webUIConfig={webUIConfig}
              selectedConversationId={selectedConversationId}
              input={input}
              setInput={setInput}
              replyToMessage={replyToMessage}
              onClearReply={clearReplyToMessage}
              onSubmit={(e) => handleSubmit(e, input, setInput, selectedDocumentId, llmStatus)}
              onReplyToMessage={handleReplyToMessage}
              onResetConversation={handleResetConversation}
              modelSource={modelSource}
              onModelSourceChange={handleModelSourceChange}
              onModeChange={handleModeChange}
              onWebUIConfigChange={handleWebUIConfigChange}
              onProviderChange={handleProviderChange}
              onAnalysisModeChange={handleAnalysisModeChange}
              onFilesSelected={handleFilesSelected}
              llmStatus={llmStatus}
            />
          </div>
          
          {showPriorityTopics && (
            <div className="w-72 border-l bg-gray-50 dark:bg-gray-900">
              <PriorityTopicsPanel
                messages={messages}
                onClose={() => setShowPriorityTopics(false)}
                onTopicSelect={(id) => {}}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
