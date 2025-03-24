
import { useState  } from '@/core/reactInstance';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, FileText, Brain, BookOpen, FileEdit } from 'lucide-react';
import { useDocumentSummary } from '@/hooks/useDocumentSummary';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DocumentSummaryPanelProps {
  documentId: string;
  title: string;
  metadata?: Record<string, any>;
}

export const DocumentSummaryPanel = ({ documentId, title, metadata }: DocumentSummaryPanelProps) => {
  const { summary, isGenerating, generateSummary } = useDocumentSummary(documentId);
  const [mode, setMode] = useState<'summary' | 'brainstorm' | 'analyze'>('summary');
  const [summaryContent, setSummaryContent] = useState<string | null>(summary?.content || null);

  const handleGenerateContent = async () => {
    try {
      switch (mode) {
        case 'summary':
          await generateSummary();
          break;
        case 'brainstorm':
          // Implémenter la génération de brainstorming
          console.log('Brainstorming à partir du document');
          break;
        case 'analyze':
          // Implémenter l'analyse approfondie
          console.log('Analyse approfondie du document');
          break;
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            {title}
          </CardTitle>
          <Select value={mode} onValueChange={(value: any) => setMode(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Résumé</SelectItem>
              <SelectItem value="brainstorm">Brainstorming</SelectItem>
              <SelectItem value="analyze">Analyse</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={handleGenerateContent}
            disabled={isGenerating}
            variant="outline"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                {mode === 'summary' && <FileText className="mr-2 h-4 w-4" />}
                {mode === 'brainstorm' && <Brain className="mr-2 h-4 w-4" />}
                {mode === 'analyze' && <BookOpen className="mr-2 h-4 w-4" />}
                Générer
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Implémentation de la création d'un nouveau document
              console.log('Créer un nouveau document');
            }}
          >
            <FileEdit className="mr-2 h-4 w-4" />
            Nouveau document
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {summaryContent ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 whitespace-pre-wrap">
                {summaryContent}
              </div>
              {metadata && (
                <div className="text-xs text-gray-500">
                  <div>Source: {metadata.source}</div>
                  <div>Dernière modification: {new Date(metadata.lastModified).toLocaleString()}</div>
                  {metadata.author && <div>Auteur: {metadata.author}</div>}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Sélectionnez un mode et cliquez sur Générer pour commencer.
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
