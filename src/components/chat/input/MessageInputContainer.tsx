
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";
import { AttachmentMenu } from "./AttachmentMenu";
import { Message } from "@/types/chat";

interface MessageInputContainerProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
  replyToMessage: Message | null;
  onCancelReply: () => void;
  onAttachment: (type: string) => void;
}

export function MessageInputContainer({
  inputValue,
  setInputValue,
  onSendMessage,
  isLoading,
  replyToMessage,
  onCancelReply,
  onAttachment
}: MessageInputContainerProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (replyToMessage) {
      inputRef.current?.focus();
    }
  }, [replyToMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="p-4 border-t">
      {replyToMessage && (
        <div className="flex items-center justify-between bg-muted p-2 rounded-md mb-2">
          <div className="flex items-center">
            <div className="w-1 h-full bg-french-blue mr-2" />
            <div className="text-sm truncate">
              <span className="font-medium">Réponse à: </span>
              {replyToMessage.content}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancelReply} className="h-6 w-6 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-start gap-2">
        <div className="flex-1 flex items-start gap-2 bg-background rounded-md border">
          <AttachmentMenu onAttach={onAttachment} />
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
          onClick={onSendMessage} 
          size="icon" 
          className="bg-french-blue hover:bg-french-blue/90"
          disabled={isLoading || inputValue.trim() === ""}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
