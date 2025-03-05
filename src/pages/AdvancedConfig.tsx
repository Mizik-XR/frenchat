
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CloudIcon, ServerIcon, FolderIcon } from "lucide-react";
import { CloudAIConfig } from "@/components/config/CloudAIConfig";
import { LocalAIConfig } from "@/components/config/llm/LocalAIConfig";
import { MicrosoftTeamsConfig } from "@/components/config/MicrosoftTeamsConfig";
import { LLMProviderType } from "@/types/config";
import { toast } from "@/hooks/use-toast";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";

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

      <Card>
        <CardHeader>
          <CardTitle>Configuration Avancée</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ai-local" className="space-y-6">
            <TabsList className="flex flex-wrap">
              <TabsTrigger value="ai-local" className="flex items-center gap-2">
                <ServerIcon className="h-4 w-4" />
                IA Open Source
              </TabsTrigger>
              <TabsTrigger value="ai-cloud" className="flex items-center gap-2">
                <CloudIcon className="h-4 w-4" />
                Services Cloud
              </TabsTrigger>
              <TabsTrigger value="storage" className="flex items-center gap-2">
                <FolderIcon className="h-4 w-4" />
                Bibliothèques Intelligentes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai-local">
              <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-medium text-green-800 mb-2">Modèles Open Source</h3>
                <p className="text-sm text-green-700">
                  Ces modèles sont gratuits, open source, et peuvent être exécutés localement ou via des API gratuites comme Hugging Face.
                  Ils offrent un bon équilibre entre performance et coût (souvent gratuit).
                </p>
              </div>
              
              <LocalAIConfig 
                modelPath={modelPath}
                onModelPathChange={setModelPath}
                provider={provider}
                onProviderChange={setProvider}
                onSave={handleLLMSave}
                defaultMode="local"
              />
            </TabsContent>

            <TabsContent value="ai-cloud">
              <div className="p-4 mb-4 bg-amber-50 border border-amber-200 rounded-md">
                <h3 className="font-medium text-amber-800 mb-2">Services Cloud</h3>
                <p className="text-sm text-amber-700">
                  Ces services sont fournis par des entreprises commerciales et nécessitent généralement des clés API pour un accès complet.
                  Ils incluent les IA propriétaires (OpenAI, Claude, etc.) pour le traitement et l'analyse de contenu.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">IA Propriétaires</h3>
                <CloudAIConfig />
              </div>
            </TabsContent>
            
            <TabsContent value="storage">
              <div className="p-4 mb-4 bg-purple-50 border border-purple-200 rounded-md">
                <h3 className="font-medium text-purple-800 mb-2">Bibliothèques Intelligentes</h3>
                <p className="text-sm text-purple-700">
                  Connectez et indexez vos documents stockés dans des services cloud pour permettre à l'IA de les analyser et d'y accéder.
                </p>
              </div>
              
              <div className="space-y-8">
                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-4">Google Drive</h3>
                  <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      Connectez et indexez vos documents Google Drive pour les analyser avec l'IA.
                    </p>
                  </div>
                  
                  <Card className="bg-white border border-gray-200">
                    <CardContent className="pt-6">
                      {isGoogleDriveChecking ? (
                        <div className="py-4 text-center">
                          <p className="text-sm text-gray-500">Vérification de la connexion...</p>
                        </div>
                      ) : isGoogleDriveConnected ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
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
                          
                          <div className="border-t border-gray-100 pt-4">
                            <div className="flex justify-between items-center">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => navigate("/documents")}
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
                        </div>
                      ) : (
                        <div className="py-2 space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-700">Google Drive non connecté</h4>
                            <p className="text-sm text-gray-500">
                              Connectez votre compte Google Drive pour accéder à vos documents.
                            </p>
                          </div>
                          <Button onClick={reconnectGoogleDrive}>
                            Connecter Google Drive
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Microsoft Teams</h3>
                  <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      Intégrez Microsoft Teams pour indexer et analyser vos fichiers, documents et conversations partagés.
                    </p>
                  </div>
                  <MicrosoftTeamsConfig />
                </div>
                
                <div className="p-6 text-center text-gray-500 border-t border-gray-200 pt-4">
                  <p>D'autres intégrations de stockage cloud seront disponibles prochainement.</p>
                  <p className="text-sm mt-2">(Dropbox, OneDrive, SharePoint...)</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
