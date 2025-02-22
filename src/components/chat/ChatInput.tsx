
import { Send, Paperclip, Search, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/config/ImportMethod/FileUploader";
import { useState } from "react";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  selectedDocumentId: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({ input, setInput, isLoading, selectedDocumentId, onSubmit }: ChatInputProps) => {
  const [showUploader, setShowUploader] = useState(false);
  const [mode, setMode] = useState<'chat' | 'search' | 'deepthink'>('chat');

  const handleFilesSelected = (files: File[]) => {
    // TODO: Implement file handling
    setShowUploader(false);
  };

  const toggleMode = (newMode: 'chat' | 'search' | 'deepthink') => {
    if (mode === newMode) {
      setMode('chat');
    } else {
      setMode(newMode);
      setInput(newMode === 'search' ? '🔍 ' : mode === 'deepthink' ? '🧠 ' : '');
    }
  };

  return (
    <div className="space-y-4">
      {showUploader && (
        <div className="p-4 bg-white rounded-lg shadow-sm border border-blue-100">
          <FileUploader onFilesSelected={handleFilesSelected} />
        </div>
      )}
      
      <form onSubmit={onSubmit} className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowUploader(!showUploader)}
            className="hover:bg-blue-50"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => toggleMode('search')}
            className={`hover:bg-blue-50 ${mode === 'search' ? 'bg-blue-100' : ''}`}
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => toggleMode('deepthink')}
            className={`hover:bg-blue-50 ${mode === 'deepthink' ? 'bg-blue-100' : ''}`}
          >
            <Brain className="h-4 w-4" />
          </Button>
        </div>

        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === 'search' 
              ? "Rechercher sur internet..." 
              : mode === 'deepthink'
              ? "Mode réflexion approfondie..."
              : selectedDocumentId 
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
    </div>
  );
};
