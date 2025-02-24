
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DocumentSummaryPanel } from './DocumentSummaryPanel';

interface DocumentPreviewProps {
  documentId: string;
  content: string;
  title: string;
}

export const DocumentPreview = ({ documentId, content, title }: DocumentPreviewProps) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <div className="prose max-w-none">
          {content}
        </div>
      </Card>
      
      <DocumentSummaryPanel 
        documentId={documentId}
        title={title}
      />
    </div>
  );
};
