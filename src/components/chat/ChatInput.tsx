
import { Send, Search, Brain, Bot } from "lucide-react";
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
  const getModeIcon = () => {
    if (mode === 'auto') return <Bot className="h-4 w-4" />;
    switch (model) {
      case 'huggingface':
        return <Brain className="h-4 w-4" />;
      case 'internet-search':
        return <Search className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getModeDescription = () => {
    if (mode === 'auto') {
      return "Mode Auto : L'IA choisit automatiquement le meilleur modèle selon votre question";
    }
    switch (model) {
      case 'huggingface':
        return "Mode Hugging Face : Utilise des modèles open source puissants";
      case 'internet-search':
        return "Mode Recherche : Recherche des informations sur Internet";
      default:
        return "Mode standard";
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex-1 flex gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center px-2">
              {getModeIcon()}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{getModeDescription()}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

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
