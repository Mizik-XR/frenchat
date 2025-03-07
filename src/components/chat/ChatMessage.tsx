
import React, { useState } from "react";
import { Message } from "@/types/chat";
import { Reply, Share, Quote } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ChatMessageProps {
  message: Message;
  messages: Message[];
  onReply: () => void;
  onForward: () => void;
  onQuote: () => void;
  isUser: boolean;
}

export function ChatMessage({ 
  message, 
  messages,
  onReply, 
  onForward, 
  onQuote,
  isUser
}: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false);
  
  // Trouver le message auquel celui-ci répond, si applicable
  const replyingTo = message.replyTo ? 
    messages.find(m => m.id === message.replyTo) : null;
  
  const formattedTime = message.timestamp ? 
    format(new Date(message.timestamp), 'HH:mm', { locale: fr }) : '';

  return (
    <div 
      className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`message-container ${isUser ? 'ml-auto' : 'mr-auto'}`}>
        {replyingTo && (
          <div className="quoted-message mb-2 max-w-full overflow-hidden text-ellipsis">
            <div className="text-xs font-medium mb-1 text-gray-500">
              En réponse à:
            </div>
            <div className="text-sm text-gray-700">{replyingTo.content}</div>
          </div>
        )}
        
        <div className={isUser ? 'message-bubble-user' : 'message-bubble-assistant'}>
          {message.content}
          <div className="message-time">
            {formattedTime}
          </div>
        </div>
        
        {showActions && (
          <div className="message-actions">
            <button 
              className="message-action-button" 
              onClick={onReply}
              title="Répondre"
            >
              <Reply className="h-3.5 w-3.5" />
            </button>
            <button 
              className="message-action-button" 
              onClick={onForward}
              title="Transférer"
            >
              <Share className="h-3.5 w-3.5" />
            </button>
            <button 
              className="message-action-button" 
              onClick={onQuote}
              title="Citer"
            >
              <Quote className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
