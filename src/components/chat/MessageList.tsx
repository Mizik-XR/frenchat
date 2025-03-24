import { React, useRef, useEffect } from '@/core/reactInstance';
import type { FC } from '@/core/reactInstance';
import { Message } from "@/types/chat";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onReplyToMessage: (message: Message) => void;
}

export const MessageList: FC<MessageListProps> = ({ 
  messages, 
  isLoading,
  onReplyToMessage
}) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4 max-w-3xl mx-auto">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`message-container flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div className={`max-w-[80%] ${
              message.role === "user" ? "message-bubble-user" : "message-bubble-assistant"
            }`}>
              {message.replyTo && messages.find(m => m.id === message.replyTo) && (
                <div 
                  className="quoted-message"
                  onClick={() => {
                    const quoted = document.getElementById(`message-${message.replyTo}`);
                    if (quoted) {
                      quoted.scrollIntoView({ behavior: "smooth" });
                      quoted.classList.add("highlight-message");
                      setTimeout(() => quoted.classList.remove("highlight-message"), 2000);
                    }
                  }}
                >
                  {messages.find(m => m.id === message.replyTo)?.content.substring(0, 60)}
                  {messages.find(m => m.id === message.replyTo)?.content.length! > 60 ? "..." : ""}
                </div>
              )}
              <div id={`message-${message.id}`}>
                {message.content}
              </div>
              <div className="message-time">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="message-actions">
                <button 
                  className="message-action-button"
                  onClick={() => onReplyToMessage(message)}
                  title="Répondre"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 17 4 12 9 7"></polyline>
                    <path d="M20 18v-2a4 4 0 0 0-4-4H4"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="message-bubble-assistant typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
        
        <div ref={endOfMessagesRef} />
      </div>
    </ScrollArea>
  );
};
