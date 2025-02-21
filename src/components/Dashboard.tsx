
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Shield,
  FileText,
  Plus,
  FileOutput,
  Loader2,
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  document_type: string;
  created_at: string;
  metadata: {
    protected?: boolean;
  };
}

export const Dashboard = () => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const { data: documents, isLoading, error } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Document[];
    }
  });

  const handleCreateDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            title: 'Nouveau document',
            document_type: 'text',
            metadata: { protected: false }
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Document créé",
        description: "Le nouveau document a été créé avec succès.",
      });
    } catch (error: any) {
      console.error('Erreur création document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le document.",
        variant: "destructive"
      });
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      // Simulation d'une génération de rapport
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Rapport généré",
        description: "Le rapport a été généré avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">
          Erreur de chargement des documents
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Documents</h2>
        <div className="flex gap-3">
          <Button onClick={handleCreateDocument}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau document
          </Button>
          <Button 
            variant="outline"
            onClick={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileOutput className="h-4 w-4 mr-2" />
            )}
            Générer un rapport
          </Button>
        </div>
      </div>

      <Card className="p-6">
        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="divide-y">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Shield className={`h-5 w-5 ${
                      doc.metadata?.protected 
                        ? 'text-green-500' 
                        : 'text-gray-300'
                    }`} />
                  </div>
                  <Button variant="ghost" size="sm">
                    Voir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Aucun document trouvé
          </div>
        )}
      </Card>
    </div>
  );
};
