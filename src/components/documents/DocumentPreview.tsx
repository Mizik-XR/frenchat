
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DocumentSummaryPanel } from './DocumentSummaryPanel';

interface DocumentPreviewProps {
  documentId?: string;
  content?: string;
  title?: string;
  file?: File;
}

export const DocumentPreview = ({ documentId, content, title, file }: DocumentPreviewProps) => {
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFileContent(text);
      };
      reader.readAsText(file);
    }
  }, [file]);

  const displayContent = content || fileContent;
  const displayTitle = title || fileName;
  
  if (!displayContent && !file) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">{displayTitle}</h2>
        <div className="prose max-w-none">
          {displayContent}
        </div>
      </Card>
      
      {documentId && (
        <DocumentSummaryPanel 
          documentId={documentId}
          title={displayTitle}
        />
      )}
    </div>
  );
};
