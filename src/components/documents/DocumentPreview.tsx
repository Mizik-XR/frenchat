
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocumentSummary } from "@/hooks/useDocumentSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface DocumentPreviewProps {
  documentId: string;
}

export const DocumentPreview = ({ documentId }: DocumentPreviewProps) => {
  const { summary, isLoading, isGenerating, generateSummary } = useDocumentSummary(documentId);
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    if (summary) {
      setContent(summary.content || "Aucun contenu disponible");
    }
  }, [summary]);

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
      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap">{content}</div>
        </div>
      </ScrollArea>
      {!content && !isGenerating && (
        <Button 
          onClick={() => generateSummary()}
          className="mt-4"
          disabled={isGenerating}
        >
          Générer un résumé
        </Button>
      )}
    </Card>
  );
};
