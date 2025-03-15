
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X } from "lucide-react";
import { AttachmentMenu } from "@/components/chat/input/AttachmentMenu";
import { ModelSelector } from "@/components/chat/input/ModelSelector";
import type { Message } from "@/types/chat";

interface ChatInputAreaProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  replyingTo: Message | null;
  cancelReply: () => void;
  handleAttachment: (type: string) => void;
  handleSendMessage: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleSubmit: (e: React.FormEvent) => void;
  iaMode: "cloud" | "auto" | "local";
  selectedModel: string;
  onModelChange: (model: string) => void;
}

export function ChatInputArea({
  inputValue,
  setInputValue,
  isLoading,
  replyingTo,
  cancelReply,
  handleAttachment,
  handleSendMessage,
  handleKeyDown,
  handleSubmit,
  iaMode,
  selectedModel,
  onModelChange
}: ChatInputAreaProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
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
  );
}
