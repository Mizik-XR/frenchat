
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DocumentProviderSelector } from "@/components/documents/DocumentProviderSelector";
import { FolderIndexingSelector } from "@/components/documents/FolderIndexingSelector";
import { PageHeader } from "@/components/navigation/PageHeader";
import { useIndexingProgress } from "@/hooks/useIndexingProgress";

export default function Documents() {
  const navigate = useNavigate();
  const { startIndexing, indexingProgress } = useIndexingProgress();
  const [isIndexing, setIsIndexing] = useState(false);

  const handleStartIndexing = async (folderId: string, options: Record<string, any> = {}) => {
    setIsIndexing(true);
    try {
      await startIndexing(folderId, options);
    } finally {
      setIsIndexing(false);
    }
  };
  
  return (
    <div className="container mx-auto py-4 space-y-6">
      <PageHeader title="Gestionnaire de Documents" />
      
      <div className="flex items-center mb-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/chat")}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au chat
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">Sources de documents</h2>
            <DocumentProviderSelector />
            <FolderIndexingSelector 
              onStartIndexing={handleStartIndexing}
              isLoading={isIndexing}
            />
            
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => navigate("/config")}
              >
                Configuration générale
              </Button>
              <Button 
                onClick={() => navigate("/chat")}
              >
                Revenir au chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
