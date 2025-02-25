
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUploader } from "@/components/config/ImportMethod/FileUploader";
import { ImageIcon, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChatInputContainerProps {
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  selectedDocumentId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  mode: 'auto' | 'manual';
  model: string;
  showUploader: boolean;
  setShowUploader: (show: boolean) => void;
  onFilesSelected: (files: File[]) => Promise<void>;
}

export const ChatInputContainer = ({
  input,
  setInput,
  isLoading,
  selectedDocumentId,
  onSubmit,
  mode,
  model,
  showUploader,
  setShowUploader,
  onFilesSelected
}: ChatInputContainerProps) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleGenerateImage = async (type: 'illustration' | 'chart') => {
    if (!input.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une description pour générer une image",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt: input,
          type
        }
      });

      if (error) throw error;

      // Ajouter l'image au chat
      setInput(input + `\n![${type === 'chart' ? 'Graphique' : 'Image'}](${data.image})`);
    } catch (error: any) {
      toast({
        title: "Erreur de génération",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="p-4 border-t flex flex-col gap-4">
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Entrez votre message..."
          className="flex-1 min-h-[80px]"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleGenerateImage('illustration')}
            disabled={isLoading || isGeneratingImage}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleGenerateImage('chart')}
            disabled={isLoading || isGeneratingImage}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowUploader(!showUploader)}
          >
            Ajouter un fichier
          </Button>
          <Button 
            type="submit"
            disabled={isLoading || !input.trim()}
          >
            Envoyer
          </Button>
        </div>
      </div>

      {showUploader && (
        <FileUploader
          onFilesSelected={onFilesSelected}
        />
      )}
    </form>
  );
};
