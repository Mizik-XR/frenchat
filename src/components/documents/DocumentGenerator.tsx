
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIProvider } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface DocumentGeneratorProps {
  selectedDocuments: string[];
  onDocumentGenerated: (content: string) => void;
}

export function DocumentGenerator({ selectedDocuments, onDocumentGenerated }: DocumentGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState<AIProvider>('huggingface');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une consigne pour la génération",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('rag-generation', {
        body: {
          prompt,
          provider,
          documentIds: selectedDocuments
        }
      });

      if (error) throw error;

      onDocumentGenerated(data.result);
      toast({
        title: "Succès",
        description: "Document généré avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le document",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Générer un document</h3>
        <p className="text-sm text-gray-500">
          Sélectionnez un modèle et entrez vos instructions pour générer un document
          à partir des documents sélectionnés.
        </p>
      </div>

      <Select value={provider} onValueChange={(value) => setProvider(value as AIProvider)}>
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un modèle" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="huggingface">Hugging Face</SelectItem>
          <SelectItem value="openai">OpenAI</SelectItem>
          <SelectItem value="perplexity">Perplexity</SelectItem>
        </SelectContent>
      </Select>

      <Input
        placeholder="Entrez vos instructions ici..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating || !prompt || selectedDocuments.length === 0}
        className="w-full"
      >
        {isGenerating ? 'Génération en cours...' : 'Générer le document'}
      </Button>
    </Card>
  );
}
