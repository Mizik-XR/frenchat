
import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/chat/ConversationSidebar";
import { MainChatContainer } from "@/components/chat/layout/MainChatContainer";
import { FrenchTitle } from "@/components/ui/FrenchTitle";
import { useConversations } from "@/hooks/useConversations";
import { useChatState } from "@/hooks/useChatState";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useSystemCapabilities } from "@/hooks/useSystemCapabilities";
import { useModelSelection } from "@/hooks/useModelSelection";

export function MainLayout() {
  const { conversations, createNewConversation, updateConversation } = useConversations();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { messages, isLoading, sendMessage, fetchMessages } = useChatMessages(selectedConversationId);
  const { llmStatus } = useSystemCapabilities();
  const { webUIConfig, handleWebUIConfigChange } = useChatState();
  const { selectedModel, setSelectedModel } = useModelSelection();
  
  useEffect(() => {
    if (conversations && conversations.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversations[0].id);
    }
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  const handleCreateNewConversation = async () => {
    const newConversation = await createNewConversation(webUIConfig);
    if (newConversation) {
      setSelectedConversationId(newConversation.id);
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
  };

  const handleIAModeChange = (mode: "cloud" | "auto" | "local") => {
    let modelSource: 'local' | 'cloud' = 'cloud';
    if (mode === 'local') {
      modelSource = 'local';
    } else if (mode === 'cloud') {
      modelSource = 'cloud';
    }
    
    handleWebUIConfigChange({
      ...webUIConfig,
      modelSource: modelSource,
      autoMode: mode === 'auto'
    });
  };

  const currentConversation = conversations?.find(c => c.id === selectedConversationId) || null;
  const currentIAMode = webUIConfig.autoMode 
    ? "auto" 
    : webUIConfig.modelSource === "local" 
    ? "local" 
    : "cloud";

  const handleFileUpload = async (files: File[]) => {
    // Cette fonction est juste un stub, elle sera connectée à la vraie fonction plus tard
    console.log("Files to upload:", files);
    return Promise.resolve();
  };

  return (
    <main className="flex h-screen overflow-hidden">
      <Sidebar
        conversations={conversations || []}
        currentConversation={currentConversation}
        onSelectConversation={handleSelectConversation}
        onCreateNewConversation={handleCreateNewConversation}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center justify-center h-14 border-b bg-white relative">
          <div className="absolute inset-x-0 top-0 h-1 french-flag-gradient"></div>
          <FrenchTitle />
        </div>
        <MainChatContainer
          conversation={currentConversation}
          messages={messages}
          isLoading={isLoading}
          iaMode={currentIAMode as "cloud" | "auto" | "local"}
          onIAModeChange={handleIAModeChange}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          onSendMessage={sendMessage}
          onFileUpload={handleFileUpload}
          onCreateNewConversation={handleCreateNewConversation}
        />
      </div>
    </main>
  );
}
