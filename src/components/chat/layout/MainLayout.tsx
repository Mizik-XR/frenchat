
import React, { useState, useEffect } from "react";
import { ChatContainer } from "@/components/chat/layout/ChatContainer";
import { Sidebar } from "@/components/chat/ConversationSidebar";
import { useConversations } from "@/hooks/useConversations";
import { useChatMessages } from "@/hooks/useChatMessages";
import { WebUIConfig, Message } from "@/types/chat";
import { toast } from "sonner";
import "@/styles/message-styles.css";
import "@/styles/layout.css";

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
  const { conversations, createNewConversation, updateConversation, deleteConversation, isLoading: conversationsLoading } = useConversations();
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
      toast.success("Nouvelle conversation créée");
    } catch (error) {
      console.error("Erreur lors de la création d'une nouvelle conversation:", error);
      toast.error("Erreur lors de la création d'une nouvelle conversation");
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
      sendMessage(input, replyToMessage?.id);
      setInput("");
      setReplyToMessage(null);
    }
  };

  // Adapter la signature de la fonction pour correspondre à celle attendue par ConversationSidebar
  const handleRenameConversation = (id: string, title: string) => {
    updateConversation({ id, title });
    toast.success("Conversation renommée");
  };

  // Gestion de chargement en cours
  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        conversations={conversations || []} 
        currentConversation={currentConversation}
        onSelectConversation={setCurrentConversationId}
        onCreateNewConversation={handleCreateNewConversation}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={(id) => {
          deleteConversation(id);
          if (currentConversationId === id) {
            setCurrentConversationId(conversations?.length > 1 ? conversations[0].id : null);
          }
          toast.success("Conversation supprimée");
        }}
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
