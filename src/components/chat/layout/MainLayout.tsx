
import React, { useState, useEffect } from "react";
import { ChatContainer } from "@/components/chat/layout/ChatContainer";
import { Sidebar } from "@/components/chat/ConversationSidebar";
import { useConversations } from "@/hooks/useConversations";
import { useChatMessages } from "@/hooks/useChatMessages";
import { WebUIConfig, Message } from "@/types/chat";

// Configuration par défaut de l'UI
const defaultWebUIConfig: WebUIConfig = {
  mode: "auto",
  model: "huggingface",
  maxTokens: 2048,
  temperature: 0.7,
  streamResponse: true,
  analysisMode: "default",
  useMemory: true,
  autoMode: true,
  modelSource: "local"
};

export function MainLayout() {
  const { conversations, createNewConversation, updateConversation, deleteConversation } = useConversations();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [input, setInput] = useState("");
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  
  // Utilisez le premier ID de conversation disponible ou null
  useEffect(() => {
    if (conversations && conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  // Trouver la conversation actuelle
  const currentConversation = conversations?.find(c => c.id === currentConversationId) || null;

  // Récupérer les messages pour la conversation actuelle
  const { messages, isLoading: messagesLoading, sendMessage } = useChatMessages(currentConversationId);

  // Créer une nouvelle conversation
  const handleCreateNewConversation = async () => {
    try {
      const newConversation = await createNewConversation(defaultWebUIConfig);
      setCurrentConversationId(newConversation.id);
    } catch (error) {
      console.error("Erreur lors de la création d'une nouvelle conversation:", error);
    }
  };

  const handleClearReply = () => {
    setReplyToMessage(null);
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() !== "" && currentConversationId) {
      sendMessage(input, currentConversationId, replyToMessage?.id);
      setInput("");
      setReplyToMessage(null);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        conversations={conversations || []} 
        currentConversation={currentConversation}
        onSelectConversation={setCurrentConversationId}
        onCreateNewConversation={handleCreateNewConversation}
        onRenameConversation={updateConversation}
        onDeleteConversation={deleteConversation}
      />
      <ChatContainer 
        messages={messages || []}
        isLoading={messagesLoading}
        llmStatus="configured"
        webUIConfig={defaultWebUIConfig}
        input={input}
        selectedDocumentId={null}
        showSettings={showSettings}
        showUploader={showUploader}
        replyToMessage={replyToMessage}
        onClearReply={handleClearReply}
        onModeChange={(mode) => console.log("Mode changed to:", mode)}
        onWebUIConfigChange={(config) => console.log("Config changed:", config)}
        onProviderChange={(provider) => console.log("Provider changed to:", provider)}
        onReplyToMessage={handleReplyToMessage}
        setInput={setInput}
        setShowSettings={setShowSettings}
        setShowUploader={setShowUploader}
        onSubmit={handleSubmit}
        onFilesSelected={async (files) => console.log("Files selected:", files)}
        onResetConversation={() => console.log("Reset conversation")}
        onAnalysisModeChange={(mode) => console.log("Analysis mode changed to:", mode)}
        modelSource="local"
        onModelSourceChange={(source) => console.log("Model source changed to:", source)}
      />
    </div>
  );
}
