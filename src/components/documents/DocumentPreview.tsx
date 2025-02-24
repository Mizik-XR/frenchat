
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useDocumentSummary } from "@/hooks/useDocumentSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDown, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DocumentPreviewProps {
  documentId: string;
  content?: string;
  onExport?: (format: 'google_drive' | 'microsoft_teams') => void;
  previewMode?: 'document' | 'presentation' | 'canvas';
}

export const DocumentPreview = ({ 
  documentId, 
  content: initialContent, 
  onExport,
  previewMode: initialPreviewMode = 'document'
}: DocumentPreviewProps) => {
  const { summary, isLoading, isGenerating, generateSummary } = useDocumentSummary(documentId);
  const [content, setContent] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<'document' | 'presentation' | 'canvas'>(initialPreviewMode);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    } else if (summary) {
      setContent(summary.content || "");
    }
  }, [initialContent, summary]);

  const handleExport = async (destination: 'google_drive' | 'microsoft_teams') => {
    try {
      await onExport?.(destination);
      toast({
        title: "Export réussi",
        description: `Document exporté vers ${destination === 'google_drive' ? 'Google Drive' : 'Microsoft Teams'}`,
      });
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Une erreur est survenue lors de l'export du document",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4 gap-2">
        <div className="flex gap-2">
          <Button
            variant={previewMode === 'document' ? 'default' : 'outline'}
            onClick={() => setPreviewMode('document')}
            size="sm"
          >
            Document
          </Button>
          <Button
            variant={previewMode === 'presentation' ? 'default' : 'outline'}
            onClick={() => setPreviewMode('presentation')}
            size="sm"
          >
            Présentation
          </Button>
          <Button
            variant={previewMode === 'canvas' ? 'default' : 'outline'}
            onClick={() => setPreviewMode('canvas')}
            size="sm"
          >
            Canvas
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('google_drive')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Google Drive
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('microsoft_teams')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Teams
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[500px] w-full rounded-md border">
        <div className={`p-4 ${previewMode !== 'document' ? 'bg-gray-50' : ''}`}>
          {previewMode === 'canvas' ? (
            <div className="bg-white p-6 rounded-lg shadow-sm mb-4">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            </div>
          ) : previewMode === 'presentation' ? (
            content.split('\n\n').map((slide, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm mb-4">
                {slide}
              </div>
            ))
          ) : (
            <div className="prose max-w-none whitespace-pre-wrap">
              {content}
            </div>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
};
