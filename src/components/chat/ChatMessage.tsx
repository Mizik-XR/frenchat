
import React, { useState } from '@/core/reactInstance';
import type { Message } from "@/types/chat";
import { MessageQuote } from "./message/MessageQuote";
import { MessageContent } from "./message/MessageContent";
import { MessageTimestamp } from "./message/MessageTimestamp";
import { MessageActions } from "./message/MessageActions";

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

  // Find the message this is replying to, if any
  const replyToMessage = message.quotedMessageId ? 
    messages.find((m) => m.id === message.quotedMessageId) : undefined;

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={`max-w-[80%] ${
          isUser
            ? "bg-french-blue text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
            : "bg-muted rounded-tl-lg rounded-tr-lg rounded-br-lg"
        } p-3 relative group`}
      >
        <MessageQuote quotedMessage={replyToMessage} isUser={isUser} />
        
        <div className="whitespace-pre-wrap break-words">
          <MessageContent content={message.content} />
        </div>
        
        <MessageTimestamp timestamp={message.timestamp} />
        
        <MessageActions 
          content={message.content}
          isUser={isUser}
          isVisible={showActions}
          onReply={onReply}
          onForward={onForward}
          onQuote={onQuote}
        />
      </div>
    </div>
  );
}
