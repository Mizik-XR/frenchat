
import React, { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Send, Home, ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ThreeStateToggle } from "@/components/ui/ThreeStateToggle";
import { SettingsDialog } from "@/components/chat/settings/SettingsDialog";
import { AttachmentMenu } from "@/components/chat/input/AttachmentMenu";
import { ModelSelector } from "@/components/chat/input/ModelSelector";
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
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    inputRef.current?.focus();
  };

  const handleForwardMessage = (message: Message) => {
    setInputValue(message.content);
    inputRef.current?.focus();
    toast({
      title: "Message transféré",
      description: "Le contenu du message a été copié dans la zone de texte",
    });
  };

  const handleQuoteMessage = (message: Message) => {
    setInputValue(`> ${message.content}\n\n`);
    inputRef.current?.focus();
  };

  const cancelReply = () => {
    setReplyingTo(null);
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

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Bienvenue sur Frenchat</h2>
          <p className="text-muted-foreground mb-6">
            Posez vos questions ou téléchargez des documents pour commencer une conversation.
          </p>
          <Button 
            className="bg-french-blue hover:bg-french-blue/90 flex items-center"
            onClick={onCreateNewConversation}
          >
            <Plus className="mr-2 h-4 w-4" /> Nouvelle conversation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <ThreeStateToggle
            options={[
              { value: "cloud", label: "IA Cloud" },
              { value: "auto", label: "Auto" },
              { value: "local", label: "IA Local" },
            ]}
            value={iaMode}
            onValueChange={onIAModeChange}
          />

          <Button variant="outline">Réinitialiser</Button>
          <SettingsDialog />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold mb-4">Bienvenue sur Frenchat</h2>
              <p className="text-muted-foreground mb-6">
                Posez vos questions ou téléchargez des documents pour commencer une conversation.
              </p>
              <Button 
                className="bg-french-blue hover:bg-french-blue/90 flex items-center"
                onClick={onCreateNewConversation}
              >
                <Plus className="mr-2 h-4 w-4" /> Nouvelle conversation
              </Button>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                messages={messages}
                onReply={() => handleReplyToMessage(message)}
                onForward={() => handleForwardMessage(message)}
                onQuote={() => handleQuoteMessage(message)}
                isUser={message.role === 'user'}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        {replyingTo && (
          <div className="flex items-center justify-between bg-muted p-2 rounded-md mb-2">
            <div className="flex items-center">
              <div className="w-1 h-full bg-french-blue mr-2" />
              <div className="text-sm truncate">
                <span className="font-medium">Réponse à: </span>
                {replyingTo.content}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={cancelReply} 
              className="h-6 w-6 p-0"
              type="button"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-start gap-2">
          <div className="flex-1 flex items-start gap-2 bg-background rounded-md border">
            <AttachmentMenu onAttach={handleAttachment} />
            <Textarea
              ref={inputRef}
              placeholder="Tapez votre message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1}
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleSendMessage} 
            size="icon" 
            className="bg-french-blue hover:bg-french-blue/90"
            disabled={isLoading || !inputValue.trim()}
            type="submit"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <div>Mode: {iaMode === "auto" ? "Automatique" : iaMode === "cloud" ? "IA Cloud" : "IA Local"}</div>
          {iaMode !== "auto" && (
            <ModelSelector 
              selectedModel={selectedModel} 
              onSelectModel={onModelChange}
              modelSource={iaMode === "cloud" ? "cloud" : "local"}
            />
          )}
        </div>
      </form>
    </div>
  );
}
