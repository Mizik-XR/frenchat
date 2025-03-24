
import React, { useState } from '@/core/reactInstance';
import { useToast } from "@/hooks/use-toast";
import { ChatHeader } from "./ChatHeader";
import { MessageArea } from "./MessageArea";
import { ChatInputArea } from "./ChatInputArea";
import type { Message } from "@/types/chat";

interface MainChatContainerProps {
  conversation: any;
  messages: Message[];
  isLoading: boolean;
  iaMode: "cloud" | "auto" | "local";
  selectedModel: string;
  onIAModeChange: (mode: "cloud" | "auto" | "local") => void;
  onModelChange: (model: string) => void;
  onSendMessage: (text: string, conversationId: string, replyToId?: string) => void;
  onFileUpload: (files: File[]) => Promise<void>;
  onCreateNewConversation: () => void;
}

export function MainChatContainer({
  conversation,
  messages,
  isLoading,
  iaMode,
  selectedModel,
  onIAModeChange,
  onModelChange,
  onSendMessage,
  onFileUpload,
  onCreateNewConversation
}: MainChatContainerProps) {
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const { toast } = useToast();

  const handleSendMessage = () => {
    if (!inputValue.trim() || !conversation) return;

    onSendMessage(
      inputValue, 
      conversation.id, 
      replyingTo?.id
    );
    
    setInputValue("");
    setReplyingTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyingTo(message);
  };

  const handleForwardMessage = (message: Message) => {
    setInputValue(message.content);
    toast({
      title: "Message transféré",
      description: "Le contenu du message a été copié dans la zone de texte",
    });
  };

  const handleQuoteMessage = (message: Message) => {
    setInputValue(`> ${message.content}\n\n`);
  };

  const handleAttachment = (type: string) => {
    if (type === "upload") {
      // Simuler un clic sur l'input file
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.multiple = true;
      fileInput.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          onFileUpload(Array.from(target.files));
        }
      };
      fileInput.click();
    } else {
      toast({
        title: `Pièce jointe: ${type}`,
        description: "Cette fonctionnalité sera bientôt disponible.",
      });
    }
  };

  const handleResetConversation = () => {
    // Reset conversation logic - this is a stub that maintains the interface
    console.log("Resetting conversation");
    // The actual implementation would go here
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        iaMode={iaMode} 
        onIAModeChange={onIAModeChange}
        onResetConversation={handleResetConversation}
      />

      <MessageArea 
        conversation={conversation}
        messages={messages}
        onCreateNewConversation={onCreateNewConversation}
        onReplyToMessage={handleReplyToMessage}
        onForwardMessage={handleForwardMessage}
        onQuoteMessage={handleQuoteMessage}
      />

      {conversation && (
        <ChatInputArea 
          inputValue={inputValue}
          setInputValue={setInputValue}
          isLoading={isLoading}
          replyingTo={replyingTo}
          cancelReply={() => setReplyingTo(null)}
          handleAttachment={handleAttachment}
          handleSendMessage={handleSendMessage}
          handleKeyDown={handleKeyDown}
          handleSubmit={handleSubmit}
          iaMode={iaMode}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
        />
      )}
    </div>
  );
}
