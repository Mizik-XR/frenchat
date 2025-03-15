
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, CheckCircle, Server, Brain, CpuIcon, ArrowRight } from "lucide-react";
import { SystemCapabilities } from "@/types/system";

interface InstallationSummaryProps {
  ollamaInstalled: boolean;
  modelInstalled: boolean;
  capabilities?: SystemCapabilities;
  onComplete: () => void;
}

export function InstallationSummary({ 
  ollamaInstalled, 
  modelInstalled,
  capabilities,
  onComplete 
}: InstallationSummaryProps) {
  // Vérifier quelle version du modèle a été installée
  const getInstalledModel = () => {
    const defaultModel = localStorage.getItem('defaultModel');
    
    if (defaultModel?.includes('mixtral')) {
      return "Mixtral-8x7B-Instruct-v0.1";
    } else if (defaultModel?.includes('mistral:4b')) {
      return "Mistral-7B-Instruct-v0.2 (quantifié 4-bit)";
    } else {
      return "Mistral-7B-Instruct-v0.2";
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-7 w-7 text-green-600" />
            <h3 className="text-xl font-medium">Installation terminée</h3>
          </div>
          
          <Alert className="bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              L'installation de l'IA locale est terminée. FileChat est maintenant configuré pour utiliser votre modèle local.
            </AlertDescription>
          </Alert>
          
          <div>
            <h4 className="font-medium mb-3">Résumé de l'installation:</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                  <Server className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Ollama installé</p>
                  <p className="text-sm text-gray-600">
                    Moteur d'IA local configuré à l'adresse http://localhost:11434
                  </p>
                </div>
              </li>
              
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                  <Brain className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Modèle IA configuré</p>
                  <p className="text-sm text-gray-600">
                    {getInstalledModel()}
                  </p>
                </div>
              </li>
              
              <li className="flex items-start gap-3">
                <div className="bg-green-100 rounded-full p-1 mt-0.5">
                  <CpuIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Configuration matérielle</p>
                  <p className="text-sm text-gray-600">
                    {capabilities?.hasGpu 
                      ? `GPU détecté: ${capabilities.gpuInfo || 'Accélération matérielle disponible'}`
                      : 'Mode CPU : performances réduites mais fonctionnel'
                    }
                  </p>
                </div>
              </li>
            </ul>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Prochaines étapes:</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>Assurez-vous qu'Ollama est en cours d'exécution avant d'utiliser FileChat</li>
              <li>Commencez à discuter avec votre assistant IA local</li>
              <li>Vous pouvez à tout moment basculer entre l'IA locale et les services cloud</li>
            </ol>
          </div>
          
          <div className="flex justify-center pt-2">
            <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700 gap-2">
              Terminer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
