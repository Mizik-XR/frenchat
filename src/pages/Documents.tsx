import { React } from "@/core/ReactInstance";
import { React, useState, useEffect } from '@/core/ReactInstance';
import { DocumentProviderSelector } from '@/components/documents/DocumentProviderSelector';
import { DocumentManager } from '@/components/documents/DocumentManager';
import { DocumentGenerator } from '@/components/documents/DocumentGenerator';
import { DocumentPreview } from '@/components/documents/DocumentPreview';
import { Card } from '@/components/ui/card';
import { GoogleDriveAdvancedConfig } from '@/components/config/GoogleDrive/GoogleDriveAdvancedConfig';
import { useToast } from '@/hooks/use-toast';

const Documents: React.FC = () => {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [generatedDocumentContent, setGeneratedDocumentContent] = useState<string>("");
  const [isConnectedToDrive, setIsConnectedToDrive] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is connected to Google Drive
    // This is a placeholder, in a real app, you'd check the connection status
    const checkDriveConnection = async () => {
      try {
        // Simulation d'une vérification de connexion
        // À remplacer par un appel API réel
        setTimeout(() => {
          setIsConnectedToDrive(true);
        }, 1000);
      } catch (error) {
        console.error("Erreur lors de la vérification de la connexion:", error);
      }
    };
    
    checkDriveConnection();
  }, []);

  const handleStartIndexing = (recursive: boolean) => {
    // Implement the actual start indexing logic
    console.log('Starting indexing with recursive:', recursive);
    toast({
      title: "Indexation démarrée",
      description: `Indexation ${recursive ? 'récursive' : 'simple'} en cours...`,
    });
    
    // Simuler une progression d'indexation pour démonstration
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      console.log(`Indexation: ${progress}%`);
      if (progress >= 100) {
        clearInterval(interval);
        toast({
          title: "Indexation terminée",
          description: "Tous les documents ont été indexés avec succès.",
        });
      }
    }, 500);
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
        connected={isConnectedToDrive}
        onIndexingRequest={handleStartIndexing}
      />
    </div>
  );
};

export default Documents;
