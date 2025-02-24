
import { FC } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentListProps {
  documents: any[];
  onSelect: (documentId: string) => void;
}

export const DocumentList: FC<DocumentListProps> = ({ documents, onSelect }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelect(doc.id)}
              >
                <h3 className="font-medium">{doc.title}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {documents.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                Aucun document disponible
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
