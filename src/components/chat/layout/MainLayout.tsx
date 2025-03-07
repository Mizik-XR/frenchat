
import React, { useState, useEffect } from "react";
import { ChatContainer } from "@/components/chat/layout/ChatContainer";
import { Sidebar } from "@/components/chat/ConversationSidebar";
import { useConversations } from "@/hooks/useConversations";
import { useChatMessages } from "@/hooks/useChatMessages";
import { WebUIConfig } from "@/types/chat";

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
  
  // Utilisez le premier ID de conversation disponible ou null
  useEffect(() => {
    if (conversations && conversations.length > 0 && !currentConversationId) {
      setCurrentConversationId(conversations[0].id);
    }
  }, [conversations, currentConversationId]);

  // Trouver la conversation actuelle
  const currentConversation = conversations?.find(c => c.id === currentConversationId) || null;

  // Récupérer les messages pour la conversation actuelle
  const { messages, isLoading: messagesLoading } = useChatMessages(currentConversationId);

  // Créer une nouvelle conversation
  const handleCreateNewConversation = async () => {
    try {
      const newConversation = await createNewConversation(defaultWebUIConfig);
      setCurrentConversationId(newConversation.id);
    } catch (error) {
      console.error("Erreur lors de la création d'une nouvelle conversation:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar 
        conversations={conversations || []} 
        currentConversation={currentConversation}
        onSelectConversation={setCurrentConversationId}
        onCreateNewConversation={handleCreateNewConversation}
        onRenameConversation={(id, title) => updateConversation({ id, title })}
        onDeleteConversation={deleteConversation}
      />
      <ChatContainer 
        conversation={currentConversation}
        messages={messages || []}
        isLoading={messagesLoading}
        onCreateNewConversation={handleCreateNewConversation}
      />
    </div>
  );
}
