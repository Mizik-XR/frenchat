import { useState } from "react";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen } from "lucide-react";
import { DocumentSummary } from "./DocumentSummary";

export function DocumentList({ documents }) {
  const [selectedDocument, setSelectedDocument] = useState(null);

  return (
    <div className="space-y-4">
      {selectedDocument && (
        <DocumentSummary 
          documentId={selectedDocument.id} 
          title={selectedDocument.title}
          metadata={selectedDocument.metadata}
        />
      )}

      <Table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Date de création</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr 
              key={document.id}
              className="cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedDocument(document)}
            >
              <td>
                <div className="flex items-center space-x-2">
                  {document.mimeType === 'application/vnd.google-apps.folder' ? (
                    <FolderOpen className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span>{document.title}</span>
                </div>
              </td>
              <td>{new Date(document.createdTime).toLocaleDateString()}</td>
              <td>
                <Button variant="ghost" size="sm">
                  Voir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
