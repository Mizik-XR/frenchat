
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  selectedDocumentId: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({ input, setInput, isLoading, selectedDocumentId, onSubmit }: ChatInputProps) => {
  return (
    <form onSubmit={onSubmit} className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={selectedDocumentId 
          ? "Posez une question sur le document..." 
          : "Posez votre question..."
        }
        disabled={isLoading}
        className="flex-1 border-blue-200 focus:border-blue-500"
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
