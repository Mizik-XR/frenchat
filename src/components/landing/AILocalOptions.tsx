
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Cpu, Download, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { isOllamaAvailable, isPythonServerAvailable } from "@/utils/environment/localAIDetection";

export function AILocalOptions() {
  const [activeTab, setActiveTab] = useState<"ollama" | "python">("ollama");
  const [isChecking, setIsChecking] = useState(true);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);
  const [pythonAvailable, setPythonAvailable] = useState(false);
  
  useEffect(() => {
    const checkServices = async () => {
      setIsChecking(true);
      
      const ollama = await isOllamaAvailable();
      setOllamaAvailable(ollama);
      
      const python = await isPythonServerAvailable();
      setPythonAvailable(python);
      
      setIsChecking(false);
    };
    
    checkServices();
  }, []);
  
  const getOllamaInstallCommand = () => {
    const os = window.navigator.platform.toLowerCase();
    
    if (os.includes('win')) {
      return "Téléchargez et exécutez l'installateur depuis ollama.ai/download";
    } else if (os.includes('mac')) {
      return "curl -fsSL https://ollama.ai/install.sh | sh";
    } else {
      return "curl -fsSL https://ollama.ai/install.sh | sh";
    }
  };
  
  const getPythonInstallCommand = () => {
    const os = window.navigator.platform.toLowerCase();
    
    if (os.includes('win')) {
      return "pip install transformers torch";
    } else if (os.includes('mac')) {
      return "pip3 install transformers torch";
    } else {
      return "pip3 install transformers torch";
    }
  };
  
  const handleOllamaDownload = () => {
    window.open("https://ollama.ai/download", "_blank");
  };
  
  const handlePythonDownload = () => {
    window.open("https://www.python.org/downloads/", "_blank");
  };
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Options d'IA locale</h2>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            FileChat offre deux méthodes complémentaires pour exécuter l'IA localement sur votre ordinateur, 
            donnant la priorité à votre confidentialité tout en offrant des performances optimales.
          </p>
          
          {isChecking ? (
            <Alert className="bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <AlertDescription className="text-blue-700">
                  Détection des services d'IA locale...
                </AlertDescription>
              </div>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert className={`${ollamaAvailable ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center gap-2">
                  {ollamaAvailable ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  <AlertDescription className={ollamaAvailable ? "text-green-700" : "text-gray-700"}>
                    Ollama est {ollamaAvailable ? "installé et prêt" : "non détecté sur ce système"}
                  </AlertDescription>
                </div>
              </Alert>
              
              <Alert className={`${pythonAvailable ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}>
                <div className="flex items-center gap-2">
                  {pythonAvailable ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  <AlertDescription className={pythonAvailable ? "text-green-700" : "text-gray-700"}>
                    Python/Transformers est {pythonAvailable ? "installé et prêt" : "non détecté sur ce système"}
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          )}
        </div>
        
        <Tabs 
          defaultValue="ollama" 
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "ollama" | "python")}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger 
              value="ollama" 
              className="flex items-center gap-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-800"
            >
              <Server className="h-4 w-4" />
              Option 1: Ollama
            </TabsTrigger>
            <TabsTrigger 
              value="python" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-800"
            >
              <Cpu className="h-4 w-4" />
              Option 2: Python/Transformers
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-4">
            {activeTab === "ollama" && (
              <Card className="border-green-200">
                <CardHeader className="bg-green-50 border-b border-green-100">
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Server className="h-5 w-5 text-green-600" />
                    Ollama - IA locale optimisée
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Solution recommandée pour la plupart des utilisateurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-medium mb-2">Avantages</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li>Installation simple en un clic</li>
                        <li>Performances optimales sans configuration complexe</li>
                        <li>Idéal pour les discussions longues et le chat</li>
                        <li>Nombreux modèles pré-configurés disponibles</li>
                        <li>Gestion intelligente de la mémoire et du GPU</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Installation</h3>
                      <div className="bg-black rounded-md p-3">
                        <code className="text-green-400 text-sm font-mono">
                          {getOllamaInstallCommand()}
                        </code>
                      </div>
                    </div>
                    
                    {!ollamaAvailable && (
                      <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                        <p className="text-amber-800 text-sm">
                          Ollama n'est pas détecté sur votre système. Pour une expérience optimale, nous recommandons son installation.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2 pb-4">
                  {ollamaAvailable ? (
                    <Button className="bg-green-600 hover:bg-green-700">
                      Utiliser Ollama
                    </Button>
                  ) : (
                    <Button onClick={handleOllamaDownload} className="gap-2">
                      <Download className="h-4 w-4" />
                      Télécharger Ollama
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}
            
            {activeTab === "python" && (
              <Card className="border-blue-200">
                <CardHeader className="bg-blue-50 border-b border-blue-100">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Cpu className="h-5 w-5 text-blue-600" />
                    Python/Transformers - Flexible et intégré
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Option avancée pour les utilisateurs familiers avec Python
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 pb-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-medium mb-2">Avantages</h3>
                      <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        <li>Accès à la bibliothèque complète de modèles Hugging Face</li>
                        <li>Personnalisation avancée possible</li>
                        <li>Idéal pour l'analyse de texte et les tâches spécifiques</li>
                        <li>Parfait comme complément à Ollama</li>
                        <li>S'intègre avec l'écosystème Python</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-medium mb-2">Installation</h3>
                      <div className="bg-black rounded-md p-3">
                        <code className="text-blue-400 text-sm font-mono">
                          {getPythonInstallCommand()}
                        </code>
                      </div>
                    </div>
                    
                    {!pythonAvailable && (
                      <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                        <p className="text-amber-800 text-sm">
                          Python avec la bibliothèque Transformers n'est pas détecté sur votre système. Cette option est recommandée pour les utilisateurs avancés.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2 pb-4">
                  {pythonAvailable ? (
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Utiliser Python/Transformers
                    </Button>
                  ) : (
                    <Button onClick={handlePythonDownload} variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Télécharger Python
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )}
          </div>
        </Tabs>
        
        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-purple-800 mb-2">Fonctionnement complémentaire</h3>
          <p className="text-purple-700 mb-3">
            Les deux options peuvent être installées simultanément pour une expérience optimale :
          </p>
          <ul className="list-disc pl-5 space-y-1 text-purple-700">
            <li><strong>Ollama</strong> excelle dans les discussions longues et la génération de texte</li>
            <li><strong>Python/Transformers</strong> est idéal pour l'analyse et les tâches spécialisées</li>
            <li>FileChat bascule intelligemment entre les deux selon vos besoins</li>
            <li>Le mode automatique hybride utilise l'option la plus adaptée à chaque requête</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
