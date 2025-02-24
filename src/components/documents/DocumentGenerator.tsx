
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useDocumentSynthesis, OutputFormat, Destination } from '@/hooks/useDocumentSynthesis';
import { Loader2, FileDown, Upload } from "lucide-react";

interface DocumentGeneratorProps {
  selectedDocuments: string[];
  onComplete?: (content: string) => void;
}

export function DocumentGenerator({ selectedDocuments, onComplete }: DocumentGeneratorProps) {
  const [query, setQuery] = useState('');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('document');
  const [destination, setDestination] = useState<Destination>('preview');
  const { generateDocument, isGenerating, generatedContent } = useDocumentSynthesis();

  const handleGenerate = async () => {
    try {
      const result = await generateDocument({
        query,
        sourceDocuments: selectedDocuments,
        outputFormat,
        destination
      });

      if (onComplete) {
        onComplete(result.content);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>Votre demande</Label>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Décrivez le document que vous souhaitez générer..."
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Format de sortie</Label>
          <Select value={outputFormat} onValueChange={(value: OutputFormat) => setOutputFormat(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="document">Document</SelectItem>
              <SelectItem value="presentation">Présentation</SelectItem>
              <SelectItem value="spreadsheet">Feuille de calcul</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Destination</Label>
          <Select value={destination} onValueChange={(value: Destination) => setDestination(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir une destination" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preview">Prévisualisation</SelectItem>
              <SelectItem value="google_drive">Google Drive</SelectItem>
              <SelectItem value="microsoft_teams">Microsoft Teams</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating || !query || selectedDocuments.length === 0}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Génération en cours...
          </>
        ) : (
          <>
            {destination === 'preview' ? <FileDown className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
            Générer
          </>
        )}
      </Button>

      {generatedContent && destination === 'preview' && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <pre className="whitespace-pre-wrap text-sm">{generatedContent}</pre>
        </div>
      )}
    </Card>
  );
}
