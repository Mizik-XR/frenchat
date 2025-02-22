
import { Send, Paperclip, Search, Brain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/config/ImportMethod/FileUploader";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";

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
  const [uploadLoading, setUploadLoading] = useState(false);
  const { user } = useAuth();

  const handleFilesSelected = async (files: File[]) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour téléverser des fichiers",
        variant: "destructive"
      });
      return;
    }

    setUploadLoading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const { data, error } = await supabase.functions.invoke('upload-chat-file', {
          body: formData,
          headers: {
            'x-user-id': user.id
          }
        });

        if (error) throw error;

        // Insert the file link into the chat input
        const fileUrl = data.publicUrl;
        const fileName = data.fileName;
        setInput(input + `\n[${fileName}](${fileUrl})`);
      }
      setShowUploader(false);
      toast({
        title: "Fichiers téléversés avec succès",
        description: "Vous pouvez maintenant les utiliser dans votre message",
      });
    } catch (error) {
      console.error('Upload error:', error);
      if (error.message?.includes('Google Drive not connected')) {
        toast({
          title: "Google Drive non connecté",
          description: "Veuillez connecter votre compte Google Drive dans les paramètres",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur lors du téléversement",
          description: "Une erreur est survenue lors du téléversement des fichiers",
          variant: "destructive"
        });
      }
    } finally {
      setUploadLoading(false);
    }
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
          <FileUploader onFilesSelected={handleFilesSelected} loading={uploadLoading} />
        </div>
      )}
      
      <form onSubmit={onSubmit} className="flex gap-2 bg-white p-2 rounded-lg shadow-sm">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowUploader(!showUploader)}
            className={`hover:bg-blue-50 ${showUploader ? 'bg-blue-100' : ''}`}
            disabled={uploadLoading}
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
          disabled={isLoading || uploadLoading}
          className="flex-1 border-blue-200 focus:border-blue-500"
        />
        <Button 
          type="submit" 
          disabled={isLoading || !input.trim() || uploadLoading}
          className="bg-blue-500 hover:bg-blue-600 transition-colors"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};
