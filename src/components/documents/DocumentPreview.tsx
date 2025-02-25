
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Eye, EyeOff } from "lucide-react";
import { DocumentPreviewPanel } from "./preview/DocumentPreviewPanel";

interface DocumentPreviewProps {
  documentId: string;
  content: string;
  onExport?: (destination: 'drive' | 'teams') => Promise<void>;
}

export const DocumentPreview = ({ 
  documentId, 
  content,
  onExport 
}: DocumentPreviewProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `document-${documentId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card className="w-full bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document {documentId}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={() => setShowFullPreview(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-100"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? "max-h-full" : "max-h-20"
            }`}
          >
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{content}</p>
          </div>
          {!isExpanded && content.length > 200 && (
            <div className="mt-2">
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="p-0 h-auto text-xs text-blue-500 hover:text-blue-600"
              >
                Voir plus...
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showFullPreview && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl h-[80vh] flex flex-col">
            <DocumentPreviewPanel
              content={content}
              title={`Document ${documentId}`}
              onExport={onExport}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:text-white/80"
            onClick={() => setShowFullPreview(false)}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
};
