import React, { useState, useEffect } from 'react';
import { DocumentProviderSelector } from '@/components/documents/DocumentProviderSelector';
import { DocumentManager } from '@/components/documents/DocumentManager';
import { DocumentGenerator } from '@/components/documents/DocumentGenerator';
import { DocumentPreview } from '@/components/documents/DocumentPreview';
import { Card } from '@/components/ui/card';
import { GoogleDriveAdvancedConfig } from '@/components/config/GoogleDrive/GoogleDriveAdvancedConfig';

const Documents: React.FC = () => {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [generatedDocumentContent, setGeneratedDocumentContent] = useState<string>("");

  const handleStartIndexing = (recursive: boolean) => {
    // Implement the actual start indexing logic
    console.log('Starting indexing with recursive:', recursive);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Documents</h1>

      <DocumentProviderSelector />

      <DocumentManager />

      {selectedDocuments.length > 0 && (
        <DocumentGenerator
          selectedDocuments={selectedDocuments}
          onDocumentGenerated={(content) => setGeneratedDocumentContent(content)}
        />
      )}

      {generatedDocumentContent && (
        <Card className="p-4">
          <h3 className="text-lg font-medium">Document Généré</h3>
          <DocumentPreview documentId="generated" content={generatedDocumentContent} />
        </Card>
      )}
      <GoogleDriveAdvancedConfig
        connected={true} // provide the correct value
        onIndexingRequest={handleStartIndexing}
      />
    </div>
  );
};

export default Documents;
