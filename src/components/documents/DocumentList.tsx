
import { useState } from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, FileEdit, FileQuestion, FileSpreadsheet, FileImage } from "lucide-react";
import { DocumentSummary } from "./DocumentSummary";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Document {
  id: string;
  title: string;
  mimeType: string;
  createdTime: string;
  metadata?: Record<string, any>;
  provider: 'google_drive' | 'microsoft_teams' | 'local';
}

interface DocumentListProps {
  documents: Document[];
  onSelect: (documentId: string) => void;
}

const getDocumentIcon = (mimeType: string) => {
  switch (mimeType) {
    case 'application/vnd.google-apps.folder':
      return <FolderOpen className="h-4 w-4" />;
    case 'application/vnd.google-apps.document':
    case 'application/msword':
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return <FileEdit className="h-4 w-4" />;
    case 'application/vnd.google-apps.spreadsheet':
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return <FileSpreadsheet className="h-4 w-4" />;
    case 'image/jpeg':
    case 'image/png':
    case 'image/gif':
      return <FileImage className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export function DocumentList({ documents, onSelect }: DocumentListProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
    onSelect(document.id);
  };

  return (
    <div className="space-y-4">
      {selectedDocument && (
        <DocumentSummary 
          documentId={selectedDocument.id} 
          title={selectedDocument.title}
          metadata={selectedDocument.metadata || {}}
        />
      )}

      <ScrollArea className="h-[600px] w-full">
        <Table>
          <thead className="sticky top-0 bg-white">
            <tr>
              <th>Titre</th>
              <th>Source</th>
              <th>Date de création</th>
              <th>Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((document) => (
              <tr 
                key={document.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => handleDocumentSelect(document)}
              >
                <td>
                  <div className="flex items-center space-x-2">
                    {getDocumentIcon(document.mimeType)}
                    <span>{document.title}</span>
                  </div>
                </td>
                <td>
                  <span className="text-sm text-gray-600">
                    {document.provider === 'google_drive' ? 'Google Drive' : 
                     document.provider === 'microsoft_teams' ? 'Microsoft Teams' : 
                     'Local'}
                  </span>
                </td>
                <td>{new Date(document.createdTime).toLocaleDateString()}</td>
                <td>
                  <span className="text-sm">
                    {document.mimeType.split('/').pop()?.split('.').pop()}
                  </span>
                </td>
                <td>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDocumentSelect(document);
                    }}
                  >
                    Utiliser
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    </div>
  );
}
