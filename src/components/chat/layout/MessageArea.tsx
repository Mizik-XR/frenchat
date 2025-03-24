
import React, { useRef, useEffect } from '@/core/reactInstance';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import type { Message } from "@/types/chat";

interface MessageAreaProps {
  conversation: any;
  messages: Message[];
  onCreateNewConversation: () => void;
  onReplyToMessage: (message: Message) => void;
  onForwardMessage: (message: Message) => void;
  onQuoteMessage: (message: Message) => void;
}

export function MessageArea({
  conversation,
  messages,
  onCreateNewConversation,
  onReplyToMessage,
  onForwardMessage,
  onQuoteMessage
}: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
              onReply={() => onReplyToMessage(message)}
              onForward={() => onForwardMessage(message)}
              onQuote={() => onQuoteMessage(message)}
              isUser={message.role === 'user'}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
