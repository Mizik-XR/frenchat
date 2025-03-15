
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { DocumentProviderSelector } from "@/components/documents/DocumentProviderSelector";
import { FolderIndexingSelector } from "@/components/documents/FolderIndexingSelector";
import { PageHeader } from "@/components/navigation/PageHeader";
import { useToast } from "@/hooks/use-toast";

export default function Documents() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartIndexing = async (folderId: string, options = {}) => {
    if (!folderId) return;
    
    setIsLoading(true);
    try {
      // Simulation d'une indexation (remplacer par l'appel réel à l'API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Indexation démarrée",
        description: "L'indexation du dossier a commencé"
      });
    } catch (error) {
      console.error("Erreur lors du démarrage de l'indexation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'indexation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
              isLoading={isLoading}
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
