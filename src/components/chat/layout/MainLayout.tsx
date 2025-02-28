
import React, { useState } from "react";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatContainer } from "@/components/chat/layout/ChatContainer";
import { ChatInputContainer } from "@/components/chat/layout/ChatInputContainer";
import { ConversationList } from "@/components/chat/ConversationList";
import { DocumentList } from "@/components/chat/DocumentList";
import { SettingsPanel } from "@/components/chat/SettingsPanel";
import { FileUploader } from "@/components/chat/FileUploader";
import { PriorityTopics } from "@/components/chat/PriorityTopics";

export function MainLayout({
  conversations,
  selectedConversationId,
  messages,
  isLoading,
  llmStatus,
  webUIConfig,
  input,
  selectedDocumentId,
  showSettings,
  showUploader,
  showPriorityTopics,
  replyToMessage,
  onClearReply,
  onConversationSelect,
  onNewConversation,
  onUpdateConversation,
  onModeChange,
  onWebUIConfigChange,
  onProviderChange,
  onReplyToMessage,
  setInput,
  setShowSettings,
  setShowUploader,
  setShowPriorityTopics,
  onSubmit,
  onFilesSelected,
  onTopicSelect,
  onResetConversation,
  onAnalysisModeChange
}: any) {
  const [showConversationList, setShowConversationList] = useState(true);
  const [showDocumentList, setShowDocumentList] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Conversation List */}
      <div className={`${showConversationList ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-64 border-r bg-gray-50`}>
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={onConversationSelect}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader 
          onSettingsClick={() => setShowSettings(true)}
          onNewConversation={onNewConversation}
          onReset={onResetConversation}
        />

        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          onReplyToMessage={onReplyToMessage}
        />

        <ChatInputContainer
          input={input}
          setInput={setInput}
          onSubmit={onSubmit}
          setShowUploader={setShowUploader}
          replyToMessage={replyToMessage}
          onClearReply={onClearReply}
          isLoading={isLoading}
        />
      </div>

      {/* Right Sidebar for Documents */}
      {showDocumentList && (
        <div className="hidden md:flex flex-col w-64 border-l">
          <DocumentList 
            selectedDocumentId={selectedDocumentId}
            documents={[]}
            onDocumentSelect={() => {}}
          />
        </div>
      )}

      {/* Modals and Dialogs */}
      {showSettings && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
          <div className="flex items-center justify-center min-h-screen">
            <SettingsPanel
              webUIConfig={webUIConfig}
              onWebUIConfigChange={onWebUIConfigChange}
              onProviderChange={onProviderChange}
              onAnalysisModeChange={onAnalysisModeChange}
            />
          </div>
        </div>
      )}

      {showUploader && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
          <div className="flex items-center justify-center min-h-screen">
            <FileUploader onFilesSelected={onFilesSelected} setShowUploader={setShowUploader} />
          </div>
        </div>
      )}

      {showPriorityTopics && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
          <div className="flex items-center justify-center min-h-screen">
            <PriorityTopics onTopicSelect={onTopicSelect} setShowPriorityTopics={setShowPriorityTopics} />
          </div>
        </div>
      )}
    </div>
  );
}
