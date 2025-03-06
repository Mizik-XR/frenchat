
import React, { useEffect, useRef } from "react";
import { Message } from "@/types/chat";
import { Loader2, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onReplyToMessage?: (message: Message) => void;
}

export const MessageList = ({ messages, isLoading, onReplyToMessage }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      // Add a highlight effect to the message
      element.classList.add("highlight-message");
      setTimeout(() => {
        element.classList.remove("highlight-message");
      }, 2000);
    }
  };

  const getFormattedTime = (timestamp: string | Date) => {
    const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="flex flex-col p-4 overflow-y-auto message-list h-full"
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p className="text-xl font-medium mb-2">Bienvenue sur Frenchat</p>
          <p className="text-center max-w-md">
            Posez vos questions ou téléchargez des documents pour commencer une conversation.
          </p>
        </div>
      ) : (
        messages.map((message, index) => {
          const isUser = message.role === "user";
          const previousMessage = index > 0 ? messages[index - 1] : null;
          const showAvatar = !previousMessage || previousMessage.role !== message.role;
          const quotedMessage = message.quotedMessageId 
            ? messages.find(m => m.id === message.quotedMessageId) 
            : null;

          return (
            <div 
              key={message.id || index} 
              id={`message-${message.id}`}
              className={`message-container group flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
            >
              <div className="relative max-w-[85%]">
                <div
                  className={`flex items-start ${
                    isUser ? "flex-row-reverse space-x-reverse" : "flex-row"
                  } space-x-2`}
                >
                  {showAvatar && (
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full ${
                        isUser ? "bg-blue-600" : "bg-red-600"
                      } flex items-center justify-center text-white font-medium`}
                    >
                      {isUser ? "U" : "A"}
                    </div>
                  )}
                  <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    {quotedMessage && (
                      <div 
                        className="quoted-message w-full" 
                        onClick={() => scrollToMessage(quotedMessage.id || "")}
                      >
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Réponse à: {quotedMessage.role === "user" ? "Vous" : "Assistant"}
                        </div>
                        <div className="text-sm line-clamp-2">{quotedMessage.content}</div>
                      </div>
                    )}
                    <div
                      className={`${
                        isUser
                          ? "message-bubble-user"
                          : "message-bubble-assistant"
                      }`}
                    >
                      {message.content}
                      <div className="message-time">
                        {message.timestamp && getFormattedTime(message.timestamp)}
                      </div>
                    </div>
                    {onReplyToMessage && (
                      <div className="message-actions">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="message-action-button"
                          onClick={() => onReplyToMessage(message)}
                        >
                          <Reply className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
      {isLoading && (
        <div className="flex items-start space-x-2 mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-medium">
            A
          </div>
          <div className="message-bubble-assistant">
            <div className="typing-indicator">
              <span className="typing-dot" style={{ animationDelay: "0s" }}></span>
              <span className="typing-dot" style={{ animationDelay: "0.2s" }}></span>
              <span className="typing-dot" style={{ animationDelay: "0.4s" }}></span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};
