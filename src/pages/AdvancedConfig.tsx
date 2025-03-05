
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  CloudIcon, 
  ServerIcon, 
  FolderIcon, 
  BookOpenIcon, 
  InfoIcon 
} from "lucide-react";
import { CloudAIConfig } from "@/components/config/CloudAIConfig";
import { LocalAIConfig } from "@/components/config/llm/LocalAIConfig";
import { MicrosoftTeamsConfig } from "@/components/config/MicrosoftTeamsConfig";
import { LLMProviderType } from "@/types/config";
import { toast } from "@/hooks/use-toast";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function AdvancedConfig() {
  const navigate = useNavigate();
  const [modelPath, setModelPath] = useState("");
  const [provider, setProvider] = useState<LLMProviderType>("huggingface");
  const { 
    isConnected: isGoogleDriveConnected, 
    isChecking: isGoogleDriveChecking,
    connectionData: googleDriveConnectionData,
    reconnectGoogleDrive,
    disconnectGoogleDrive
  } = useGoogleDriveStatus();

  const handleLLMSave = () => {
    toast({
      title: "Configuration IA sauvegardée",
      description: "Vos paramètres d'IA locale ont été enregistrés avec succès.",
    });
    // Ici, vous pourriez ajouter la logique pour sauvegarder dans localStorage ou votre base de données
  };

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/config")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à la configuration
      </Button>

      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">Configuration Avancée</CardTitle>
          <CardDescription>
            Paramétrez les modèles d'intelligence artificielle et les services d'indexation de documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ai-local" className="space-y-6">
            <TabsList className="w-full flex flex-wrap justify-start border-b pb-0 rounded-none bg-transparent space-x-2">
              <TabsTrigger 
                value="ai-local" 
                className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-800 border-b-2 data-[state=active]:border-purple-600 rounded-none px-4"
              >
                <ServerIcon className="h-4 w-4" />
                IA Open Source
              </TabsTrigger>
              <TabsTrigger 
                value="ai-cloud" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 border-b-2 data-[state=active]:border-blue-600 rounded-none px-4"
              >
                <CloudIcon className="h-4 w-4" />
                Services Cloud
              </TabsTrigger>
              <TabsTrigger 
                value="storage" 
                className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 border-b-2 data-[state=active]:border-green-600 rounded-none px-4"
              >
                <FolderIcon className="h-4 w-4" />
                Bibliothèques Intelligentes
              </TabsTrigger>
              <TabsTrigger 
                value="docs" 
                className="flex items-center gap-2 data-[state=active]:bg-amber-100 data-[state=active]:text-amber-800 border-b-2 data-[state=active]:border-amber-600 rounded-none px-4"
              >
                <BookOpenIcon className="h-4 w-4" />
                Documentation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai-local">
              <div className="mb-6">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <InfoIcon className="h-5 w-5 text-purple-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-purple-800 mb-1">Modèles Open Source</h3>
                      <p className="text-sm text-purple-700 leading-relaxed">
                        Ces modèles sont gratuits, open source, et peuvent être exécutés localement via Ollama 
                        ou via des API gratuites comme Hugging Face. Ils offrent un bon équilibre entre 
                        performance et coût (souvent gratuit).
                      </p>
                    </div>
                  </div>
                </div>
                
                <LocalAIConfig 
                  modelPath={modelPath}
                  onModelPathChange={setModelPath}
                  provider={provider}
                  onProviderChange={setProvider}
                  onSave={handleLLMSave}
                  defaultMode="local"
                />
              </div>
            </TabsContent>

            <TabsContent value="ai-cloud">
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <InfoIcon className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-blue-800 mb-1">Services Cloud</h3>
                      <p className="text-sm text-blue-700 leading-relaxed">
                        Ces services sont fournis par des entreprises commerciales et nécessitent généralement 
                        des clés API pour un accès complet. Ils incluent les IA propriétaires (OpenAI, Claude, etc.) 
                        et les services d'intégration comme Microsoft Teams.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Card className="border-gray-200 shadow-sm bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">IA Propriétaires</CardTitle>
                    <CardDescription>
                      Configurez les services d'IA dans le cloud comme OpenAI, Claude, et Perplexity
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CloudAIConfig />
                  </CardContent>
                </Card>
                
                <Separator className="my-6" />
                
                <Card className="border-gray-200 shadow-sm bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Microsoft Teams</CardTitle>
                    <CardDescription>
                      Connectez votre compte Microsoft Teams pour indexer vos documents et conversations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <MicrosoftTeamsConfig />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="storage">
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <InfoIcon className="h-5 w-5 text-green-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-medium text-green-800 mb-1">Bibliothèques Intelligentes</h3>
                      <p className="text-sm text-green-700 leading-relaxed">
                        Connectez vos sources de documents pour les rendre accessibles à l'IA. Vos documents seront 
                        indexés et analysés pour permettre des réponses contextuelles pertinentes.
                      </p>
                    </div>
                  </div>
                </div>
                
                <Card className="bg-white shadow-sm border-gray-200 mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">Google Drive</CardTitle>
                    <CardDescription>
                      Connectez et indexez vos documents Google Drive pour les analyser avec l'IA
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isGoogleDriveChecking ? (
                      <div className="py-4 text-center">
                        <p className="text-sm text-gray-500">Vérification de la connexion...</p>
                      </div>
                    ) : isGoogleDriveConnected ? (
                      <div className="space-y-4">
                        <Alert className="bg-green-50 border-green-200">
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <h4 className="font-medium text-green-700">Google Drive connecté</h4>
                              <p className="text-sm text-gray-600">
                                Connecté en tant que: {googleDriveConnectionData?.email || "Utilisateur Google"}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => navigate("/google-drive")}
                              >
                                Gérer les dossiers
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={disconnectGoogleDrive}
                              >
                                Déconnecter
                              </Button>
                            </div>
                          </div>
                        </Alert>
                        
                        <div className="flex justify-between items-center mt-4">
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => navigate("/documents")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Indexer un dossier
                          </Button>
                          <p className="text-xs text-gray-500">
                            Dernière connexion: {
                              googleDriveConnectionData?.connectedSince 
                                ? new Date(googleDriveConnectionData.connectedSince).toLocaleDateString() 
                                : "Récemment"
                            }
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Alert className="bg-gray-50 border-gray-200 mb-4">
                          <div>
                            <h4 className="font-medium text-gray-700">Google Drive non connecté</h4>
                            <p className="text-sm text-gray-500">
                              Connectez votre compte Google Drive pour accéder à vos documents.
                            </p>
                          </div>
                        </Alert>
                        <Button 
                          onClick={reconnectGoogleDrive}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Connecter Google Drive
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="p-6 text-center text-gray-500 border-t border-gray-200 mt-8 pt-4">
                  <p className="font-medium">D'autres intégrations de stockage cloud seront disponibles prochainement.</p>
                  <p className="text-sm mt-2">(Dropbox, OneDrive, SharePoint...)</p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="docs">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <InfoIcon className="h-5 w-5 text-amber-700 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-800 mb-1">Documentation et Ressources</h3>
                    <p className="text-sm text-amber-700 leading-relaxed">
                      Découvrez comment tirer le meilleur parti de votre assistant IA avec ces ressources et tutoriels.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Modèles Open Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4 text-amber-600" />
                        <a href="https://ollama.com/library" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Bibliothèque de modèles Ollama
                        </a>
                      </li>
                      <li className="flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4 text-amber-600" />
                        <a href="https://huggingface.co/models" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Modèles Hugging Face
                        </a>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Services Cloud</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4 text-amber-600" />
                        <a href="https://platform.openai.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Documentation OpenAI
                        </a>
                      </li>
                      <li className="flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4 text-amber-600" />
                        <a href="https://docs.anthropic.com/claude/docs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Documentation Claude
                        </a>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
