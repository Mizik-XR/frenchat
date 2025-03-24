import { React } from "@/core/reactInstance";

import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AIProvider } from "@/types/chat";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  selectedDocumentId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  mode: 'auto' | 'manual';
  model: AIProvider;
}

export const ChatInput = ({ 
  input, 
  setInput, 
  isLoading, 
  selectedDocumentId, 
  onSubmit,
  mode,
  model
}: ChatInputProps) => {
  return (
    <form onSubmit={onSubmit} className="flex-1 flex gap-2">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={
          selectedDocumentId 
            ? "Posez une question sur le document..." 
            : "Posez votre question..."
        }
        disabled={isLoading}
        className="flex-1"
      />
      <Button 
        type="submit" 
        disabled={isLoading || !input.trim()}
        className="bg-blue-500 hover:bg-blue-600 transition-colors"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
