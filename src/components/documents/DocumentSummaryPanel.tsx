
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, FileText } from 'lucide-react';
import { useDocumentSummary } from '@/hooks/useDocumentSummary';

interface DocumentSummaryPanelProps {
  documentId: string;
  title: string;
}

export const DocumentSummaryPanel = ({ documentId, title }: DocumentSummaryPanelProps) => {
  const [summary, setSummary] = useState<string | null>(null);
  const { isGenerating, generateSummary } = useDocumentSummary();

  const handleGenerateSummary = async () => {
    try {
      const data = await generateSummary(documentId);
      setSummary(data.summary);
    } catch (error) {
      console.error('Erreur lors de la génération du résumé:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Résumé du document
        </CardTitle>
        <Button
          onClick={handleGenerateSummary}
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
              <FileText className="mr-2 h-4 w-4" />
              Générer le résumé
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="text-sm text-gray-600 whitespace-pre-wrap">
            {summary}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            Cliquez sur le bouton pour générer un résumé du document.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
