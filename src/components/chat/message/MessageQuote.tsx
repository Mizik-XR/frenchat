
import React from "react";
import { Message } from "@/types/chat";

interface MessageQuoteProps {
  quotedMessage: Message | undefined;
  isUser: boolean;
}

export function MessageQuote({ quotedMessage, isUser }: MessageQuoteProps) {
  if (!quotedMessage) return null;
  
  return (
    <div className="mb-2 pb-2 border-b border-opacity-20 text-sm opacity-80">
      <div className="flex items-center">
        <div className={`w-1 h-full ${isUser ? "bg-white" : "bg-french-blue"} mr-2`} />
        <div className="truncate">
          <span className="font-medium">Réponse à: </span>
          {quotedMessage.content}
        </div>
      </div>
    </div>
  );
}
