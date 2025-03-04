
import { useNavigate } from "react-router-dom";
import { OllamaInstaller } from "@/components/ollama/OllamaInstaller";
import { ModelDownloader } from "@/components/ollama/ModelDownloader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useSystemCapabilities } from "@/hooks/useSystemCapabilities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function OllamaSetup() {
  const navigate = useNavigate();
  const { capabilities } = useSystemCapabilities();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Configuration de l'IA locale</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Installer Ollama pour exécuter l'IA localement sur votre ordinateur, 
          avec des modèles adaptés à votre configuration matérielle
        </p>
      </div>
      
      <Tabs defaultValue="install" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="install">Installation d'Ollama</TabsTrigger>
          <TabsTrigger value="models">Modèles recommandés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="install">
          <OllamaInstaller 
            onComplete={() => {
              localStorage.setItem('localProvider', 'ollama');
              localStorage.setItem('localAIUrl', 'http://localhost:11434');
              localStorage.setItem('aiServiceType', 'local');
            }} 
          />
        </TabsContent>
        
        <TabsContent value="models">
          <ModelDownloader systemCapabilities={capabilities} />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Vous pouvez également configurer Ollama manuellement dans les paramètres avancés
        </p>
        <Button 
          variant="link" 
          onClick={() => navigate("/config/advanced")}
        >
          Paramètres avancés
        </Button>
      </div>
    </div>
  );
}
