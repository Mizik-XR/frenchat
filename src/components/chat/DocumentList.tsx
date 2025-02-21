
import { FileText, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Document {
  id: string;
  title: string;
}

interface DocumentListProps {
  documents: Document[];
  selectedDocumentId: string | null;
  onDocumentSelect: (id: string) => void;
}

export const DocumentList = ({ documents, selectedDocumentId, onDocumentSelect }: DocumentListProps) => {
  if (!documents || documents.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
        <FileText className="h-4 w-4" />
        Documents disponibles
      </h3>
      <div className="flex flex-wrap gap-2">
        {documents.map((doc) => (
          <Button
            key={doc.id}
            variant={selectedDocumentId === doc.id ? "default" : "outline"}
            size="sm"
            onClick={() => onDocumentSelect(doc.id)}
          >
            <Paperclip className="h-4 w-4 mr-1" />
            {doc.title}
          </Button>
        ))}
      </div>
    </div>
  );
};
