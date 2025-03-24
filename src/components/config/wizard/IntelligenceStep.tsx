
import { LocalAIConfig } from "../llm/LocalAIConfig";
import { ImageConfig } from "../ImageConfig";
import { LLMProviderType } from "@/types/config";
import { CloudIcon, ServerIcon, InfoIcon, Lightbulb, Image } from "lucide-react";
import { useState  } from '@/core/reactInstance';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface IntelligenceStepProps {
  modelPath: string;
  onModelPathChange: (path: string) => void;
  provider: LLMProviderType;
  onProviderChange: (provider: LLMProviderType) => void;
  onLLMSave: () => void;
  onImageConfigSave: () => void;
}

export const IntelligenceStep = ({
  modelPath,
  onModelPathChange,
  provider,
  onProviderChange,
  onLLMSave,
  onImageConfigSave
}: IntelligenceStepProps) => {
  const [aiMode, setAIMode] = useState<"local" | "cloud">("local");

  const handleModeChange = (mode: "local" | "cloud") => {
    setAIMode(mode);
    // Ajustement du provider par défaut en fonction du mode
    if (mode === "local" && !["mistral", "local", "ollama"].includes(provider)) {
      onProviderChange("mistral");
    } else if (mode === "cloud" && ["mistral", "local", "ollama"].includes(provider)) {
      onProviderChange("huggingface");
    }
  };

  return (
    <div className="animate-fade-in space-y-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold mb-2">Configuration de l'intelligence artificielle</h2>
        <p className="text-gray-600">
          Paramétrez les modèles d'IA qui seront utilisés pour analyser vos données et répondre à vos questions.
        </p>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <InfoIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <AlertDescription className="text-blue-700">
            <p className="font-medium mb-1">Deux types de modèles sont disponibles :</p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>
                <span className="font-medium">Modèles open source</span> : gratuits et exécutables localement ou via des API gratuites comme Hugging Face.
              </li>
              <li>
                <span className="font-medium">Modèles propriétaires</span> : généralement plus performants mais nécessitent des clés API et ont un coût d'utilisation.
              </li>
            </ul>
          </AlertDescription>
        </div>
      </Alert>
      
      <Card className="border-purple-200 shadow-sm">
        <CardHeader className="bg-purple-50 border-b border-purple-100 pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-700" />
            <CardTitle className="text-lg text-purple-800">Intelligence du langage</CardTitle>
          </div>
          <CardDescription className="text-purple-700">
            Configurez le modèle de langage qui sera utilisé pour comprendre et répondre à vos questions
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <h3 className="text-base font-medium mb-3">Mode de fonctionnement</h3>
            <Tabs 
              defaultValue="local" 
              value={aiMode} 
              onValueChange={(value) => handleModeChange(value as "local" | "cloud")}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 w-full max-w-md bg-gray-100 p-1 rounded-lg">
                <TabsTrigger 
                  value="local" 
                  className="flex items-center gap-2 data-[state=active]:bg-white"
                >
                  <ServerIcon className="h-4 w-4" />
                  Open Source
                </TabsTrigger>
                <TabsTrigger 
                  value="cloud" 
                  className="flex items-center gap-2 data-[state=active]:bg-white"
                >
                  <CloudIcon className="h-4 w-4" />
                  Services Cloud
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <p className="text-sm text-gray-600 mt-2">
              {aiMode === "local" 
                ? "Mode open source : modèles libres et gratuits, exécutés localement ou via des API gratuites." 
                : "Mode cloud : services IA professionnels (nécessitent généralement une clé API et un coût d'utilisation)."}
            </p>
          </div>
          
          <Separator className="my-6" />
          
          <LocalAIConfig 
            modelPath={modelPath}
            onModelPathChange={onModelPathChange}
            provider={provider}
            onProviderChange={onProviderChange}
            onSave={onLLMSave}
            defaultMode={aiMode}
          />
        </CardContent>
      </Card>
      
      <Card className="border-amber-200 shadow-sm">
        <CardHeader className="bg-amber-50 border-b border-amber-100 pb-3">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-amber-700" />
            <CardTitle className="text-lg text-amber-800">Génération d'images</CardTitle>
          </div>
          <CardDescription className="text-amber-700">
            Configurez les paramètres de génération d'images (optionnel)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ImageConfig
            onSave={onImageConfigSave}
          />
        </CardContent>
      </Card>
    </div>
  );
};
