
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/components/AuthProvider";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import { FolderCheck, AlertTriangle, Database } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FolderIndexingSelector } from "@/components/documents/FolderIndexingSelector";
import GoogleDriveConnection from "./GoogleDriveConnection";
import { useToast } from "@/hooks/use-toast";
import { useIndexingProgress } from "@/hooks/useIndexingProgress";
import { Progress } from "@/components/ui/progress";

export function GoogleDriveAdvancedConfig() {
  const { user } = useAuth();
  const { isConnected } = useGoogleDriveStatus();
  const { toast } = useToast();
  const { indexingProgress, startIndexing } = useIndexingProgress();
  const [fullDriveIndexing, setFullDriveIndexing] = useState(false);
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexingStatus, setIndexingStatus] = useState("");

  const handleFolderSelect = async (folderId: string, options: Record<string, any> = {}) => {
    if (!user) {
      toast({
        title: "Non connecté",
        description: "Vous devez être connecté pour indexer des dossiers",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsIndexing(true);
      setIndexingStatus("Démarrage de l'indexation...");
      
      // Combiner les options avec le paramètre fullDriveIndexing
      const indexOptions = {
        ...options,
        recursive: true,
        fullDriveIndexing: fullDriveIndexing,
        batchSize: options.batchSize || 100,
        maxDepth: fullDriveIndexing ? 50 : (options.maxDepth || 10),
      };
      
      const progressId = await startIndexing(folderId, indexOptions);
      
      if (progressId) {
        toast({
          title: "Indexation démarrée",
          description: fullDriveIndexing 
            ? "L'indexation complète de votre Google Drive a commencé. Cela peut prendre un certain temps."
            : "L'indexation du dossier a commencé.",
        });
        
        setIndexingStatus("Indexation en cours... Cela peut prendre du temps.");
      } else {
        throw new Error("Impossible de démarrer l'indexation");
      }
    } catch (error) {
      console.error("Erreur lors de l'indexation:", error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'indexation",
        variant: "destructive",
      });
      setIsIndexing(false);
      setIndexingStatus("");
    }
  };

  return (
    <Card className="border-gray-800 bg-gray-900/60">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Database className="mr-2 h-5 w-5 text-blue-400" />
          Configuration Google Drive avancée
        </CardTitle>
        <CardDescription className="text-gray-400">
          Indexez vos documents Google Drive pour les utiliser dans vos conversations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!isConnected ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Vous devez d'abord connecter votre compte Google Drive
            </AlertDescription>
          </Alert>
        ) : (
          <Tabs defaultValue="indexing" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="indexing">Indexation des dossiers</TabsTrigger>
              <TabsTrigger value="connection">Connexion</TabsTrigger>
            </TabsList>
            
            <TabsContent value="indexing" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox 
                    id="fullDriveIndexing" 
                    checked={fullDriveIndexing} 
                    onCheckedChange={(checked) => setFullDriveIndexing(checked === true)}
                  />
                  <Label htmlFor="fullDriveIndexing" className="font-medium cursor-pointer">
                    Indexer l'intégralité de mon Google Drive
                  </Label>
                </div>
                
                {fullDriveIndexing && (
                  <Alert className="bg-amber-900/20 border-amber-800 text-amber-100">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <AlertDescription>
                      L'indexation complète peut prendre beaucoup de temps selon la taille de votre Drive.
                      Le processus continuera en arrière-plan même si vous fermez cette page.
                    </AlertDescription>
                  </Alert>
                )}
                
                <FolderIndexingSelector 
                  onStartIndexing={handleFolderSelect} 
                  isLoading={isIndexing}
                  fullDriveMode={fullDriveIndexing}
                />
                
                {isIndexing && indexingProgress && (
                  <div className="space-y-2 mt-4">
                    <div className="flex justify-between text-sm">
                      <span>{indexingStatus || "Indexation en cours..."}</span>
                      <span>{indexingProgress.processed} / {indexingProgress.total || '?'} fichiers</span>
                    </div>
                    <Progress 
                      value={indexingProgress.total ? (indexingProgress.processed / indexingProgress.total) * 100 : 0} 
                      className="w-full"
                    />
                    <p className="text-xs text-gray-400">
                      L'indexation continue en arrière-plan même si vous naviguez ailleurs.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="connection" className="space-y-6">
              <GoogleDriveConnection onFolderSelect={handleFolderSelect} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
