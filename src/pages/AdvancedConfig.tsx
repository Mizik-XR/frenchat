
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CloudIcon, ServerIcon, FolderIcon } from "lucide-react";
import { CloudAIConfig } from "@/components/config/CloudAIConfig";
import { LocalAIConfig } from "@/components/config/llm/LocalAIConfig";
import { MicrosoftTeamsConfig } from "@/components/config/MicrosoftTeamsConfig";
import { LLMProviderType } from "@/types/config";
import { toast } from "@/hooks/use-toast";

export default function AdvancedConfig() {
  const navigate = useNavigate();
  const [modelPath, setModelPath] = useState("");
  const [provider, setProvider] = useState<LLMProviderType>("huggingface");

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
                Stockage Cloud
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
                  <h3 className="text-lg font-semibold mb-4">Microsoft Teams</h3>
                  <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      Intégrez Microsoft Teams pour indexer et analyser vos fichiers, documents et conversations partagés.
                    </p>
                  </div>
                  <MicrosoftTeamsConfig />
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-4">Google Drive</h3>
                  <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-700">
                      Configuration disponible dans la section "Sources" de la configuration principale.
                    </p>
                  </div>
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
