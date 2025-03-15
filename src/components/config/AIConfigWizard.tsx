
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cpu, Cloud, Zap, Key, CreditCard, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAIModelDownload } from "@/hooks/useAIModelDownload";
import { useSystemCapabilities } from "@/hooks/useSystemCapabilities";
import { cn } from "@/lib/utils";

export function AIConfigWizard() {
  const [mode, setMode] = useState<'local' | 'cloud' | 'hybrid'>('hybrid');
  const [selectedModel, setSelectedModel] = useState("mistral");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2000);
  const [apiKey, setApiKey] = useState("");
  const [apiProvider, setApiProvider] = useState("openai");
  const [credits, setCredits] = useState(100); // Crédits factices pour la démonstration
  
  const { downloadStatus, startModelDownload } = useAIModelDownload();
  const { gpu } = useSystemCapabilities();
  
  const handleSaveConfig = async () => {
    toast({
      title: "Configuration enregistrée",
      description: "Vos préférences d'IA ont été mises à jour avec succès."
    });
    
    // Ici, vous intégreriez la logique pour sauvegarder la configuration dans Supabase
  };
  
  const handleDownloadModel = async () => {
    try {
      await startModelDownload({
        model_id: selectedModel,
        destination: "local",
        use_gpu: gpu.available
      });
      
      toast({
        title: "Téléchargement démarré",
        description: "Le modèle sera installé en arrière-plan."
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le téléchargement du modèle.",
        variant: "destructive"
      });
    }
  };
  
  const isLocalModelReady = true; // Simulé - à remplacer par une vérification réelle
  
  return (
    <Card className="border-gray-800 bg-gray-900/60">
      <CardHeader>
        <CardTitle className="text-xl text-white">Configuration de l'Intelligence Artificielle</CardTitle>
        <CardDescription className="text-gray-400">
          Personnalisez le comportement des modèles d'IA selon vos besoins
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-white">Mode d'exécution</Label>
          <RadioGroup
            value={mode}
            onValueChange={(value) => setMode(value as 'local' | 'cloud' | 'hybrid')}
            className="grid grid-cols-3 gap-4"
          >
            <div className={cn(
              "flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-900 p-4 cursor-pointer hover:bg-gray-800/50",
              mode === 'local' && "border-green-600 bg-green-950/30"
            )}>
              <RadioGroupItem value="local" id="local" className="sr-only" />
              <Cpu className="h-6 w-6 mb-3 text-green-400" />
              <Label htmlFor="local" className="cursor-pointer font-medium text-center text-white">Local</Label>
              <p className="text-xs text-center text-gray-400 mt-2">Utilise uniquement les ressources de votre ordinateur</p>
            </div>
            
            <div className={cn(
              "flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-900 p-4 cursor-pointer hover:bg-gray-800/50",
              mode === 'cloud' && "border-blue-600 bg-blue-950/30"
            )}>
              <RadioGroupItem value="cloud" id="cloud" className="sr-only" />
              <Cloud className="h-6 w-6 mb-3 text-blue-400" />
              <Label htmlFor="cloud" className="cursor-pointer font-medium text-center text-white">Cloud</Label>
              <p className="text-xs text-center text-gray-400 mt-2">Utilise des modèles hébergés en ligne</p>
            </div>
            
            <div className={cn(
              "flex flex-col items-center justify-between rounded-md border-2 border-gray-800 bg-gray-900 p-4 cursor-pointer hover:bg-gray-800/50",
              mode === 'hybrid' && "border-purple-600 bg-purple-950/30"
            )}>
              <RadioGroupItem value="hybrid" id="hybrid" className="sr-only" />
              <Zap className="h-6 w-6 mb-3 text-purple-400" />
              <Label htmlFor="hybrid" className="cursor-pointer font-medium text-center text-white">Hybride</Label>
              <p className="text-xs text-center text-gray-400 mt-2">Bascule automatiquement selon la complexité</p>
            </div>
          </RadioGroup>
        </div>
        
        <Tabs defaultValue={mode === 'cloud' ? "cloud" : "local"} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="local" disabled={mode === 'cloud'}>Modèles locaux</TabsTrigger>
            <TabsTrigger value="cloud" disabled={mode === 'local'}>API Cloud</TabsTrigger>
          </TabsList>
          
          <TabsContent value="local" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className={cn(
                "relative flex flex-col p-6 rounded-lg border border-gray-800 bg-gray-900 hover:bg-gray-800/50 cursor-pointer transition-colors",
                selectedModel === "mistral" && "border-green-600 bg-green-950/20"
              )}
              onClick={() => setSelectedModel("mistral")}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-white">Mistral 7B</h3>
                    <p className="text-sm text-gray-400 mt-1">Modèle compact et performant (4GB)</p>
                  </div>
                  {downloadStatus.status === 'downloading' && downloadStatus.model === 'mistral' ? (
                    <div className="text-xs text-blue-400">{downloadStatus.progress}%</div>
                  ) : isLocalModelReady ? (
                    <Shield className="h-5 w-5 text-green-500" />
                  ) : null}
                </div>
                
                {!isLocalModelReady && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 self-start"
                    onClick={handleDownloadModel}
                  >
                    Télécharger
                  </Button>
                )}
              </div>
              
              <div className={cn(
                "relative flex flex-col p-6 rounded-lg border border-gray-800 bg-gray-900 hover:bg-gray-800/50 cursor-pointer transition-colors",
                selectedModel === "llama" && "border-green-600 bg-green-950/20"
              )}
              onClick={() => setSelectedModel("llama")}>
                <div>
                  <h3 className="font-medium text-white">Llama 2</h3>
                  <p className="text-sm text-gray-400 mt-1">Modèle polyvalent et stable (7GB)</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4 self-start"
                  onClick={handleDownloadModel}
                >
                  Télécharger
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Température ({temperature})</Label>
                <Slider 
                  min={0} 
                  max={1} 
                  step={0.1} 
                  value={[temperature]} 
                  onValueChange={(value) => setTemperature(value[0])}
                />
                <p className="text-xs text-gray-400">Contrôle la créativité du modèle. Valeurs basses = réponses cohérentes, valeurs hautes = réponses variées.</p>
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">Nombre maximum de tokens ({maxTokens})</Label>
                <Slider 
                  min={500} 
                  max={4000} 
                  step={100} 
                  value={[maxTokens]} 
                  onValueChange={(value) => setMaxTokens(value[0])}
                />
                <p className="text-xs text-gray-400">Limite la longueur des réponses générées.</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="cloud" className="space-y-6">
            <Select value={apiProvider} onValueChange={setApiProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un fournisseur d'API" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI (GPT-4, GPT-3.5)</SelectItem>
                <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                <SelectItem value="huggingface">Hugging Face</SelectItem>
                <SelectItem value="cohere">Cohere</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="space-y-2">
              <Label className="text-white">Clé API {apiProvider}</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  type="password" 
                  placeholder="sk-..." 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline" size="icon">
                  <Key className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 bg-blue-950/30 border border-blue-900/50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  <span className="font-medium text-white">Crédits API</span>
                </div>
                <span className="font-bold text-lg text-white">{credits}</span>
              </div>
              
              <div className="mt-3 text-xs text-gray-400">
                <p>Les crédits sont utilisés uniquement pour les API externes.</p>
                <p className="mt-1">Coût estimé: ~0.5 crédit par requête GPT-4, ~0.05 crédit par requête GPT-3.5</p>
              </div>
              
              <Button variant="default" size="sm" className="mt-3">
                Recharger des crédits
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button onClick={handleSaveConfig}>
          Enregistrer la configuration
        </Button>
      </CardFooter>
    </Card>
  );
}
