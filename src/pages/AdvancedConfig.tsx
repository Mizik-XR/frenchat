
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CloudIcon, ServerIcon, BriefcaseIcon, FolderIcon } from "lucide-react";
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
                IA Propriétaire
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <BriefcaseIcon className="h-4 w-4" />
                Services externes
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
                <h3 className="font-medium text-amber-800 mb-2">Services IA Propriétaires</h3>
                <p className="text-sm text-amber-700">
                  Ces services IA sont fournis par des entreprises commerciales et nécessitent généralement des clés API et des paiements en fonction de l'utilisation.
                  Ils offrent souvent des performances supérieures mais à un coût plus élevé.
                </p>
              </div>
              <CloudAIConfig />
            </TabsContent>

            <TabsContent value="services">
              <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">Services collaboratifs</h3>
                <p className="text-sm text-blue-700">
                  Configuration des intégrations avec Microsoft Teams et autres plateformes collaboratives.
                </p>
              </div>
              <MicrosoftTeamsConfig />
            </TabsContent>
            
            <TabsContent value="storage">
              <div className="p-4 mb-4 bg-purple-50 border border-purple-200 rounded-md">
                <h3 className="font-medium text-purple-800 mb-2">Stockage Cloud</h3>
                <p className="text-sm text-purple-700">
                  Configurez l'accès aux services de stockage cloud comme Google Drive, Dropbox ou OneDrive.
                </p>
              </div>
              <div className="p-6 text-center text-gray-500">
                <p>Les intégrations de stockage supplémentaires seront disponibles prochainement.</p>
                <p className="text-sm mt-2">Actuellement, Google Drive est disponible via la section "Sources" de la configuration.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
