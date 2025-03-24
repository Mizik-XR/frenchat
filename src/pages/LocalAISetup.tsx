
import { useState, useEffect  } from '@/core/reactInstance';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Steps } from "@/components/ui/steps";
import { ArrowLeft, Home, Download, ServerIcon } from "lucide-react";
import { useSystemCapabilities } from "@/hooks/useSystemCapabilities";
import { isOllamaAvailable, configureOllama } from "@/utils/environment/localAIDetection";
import { downloadInstallationScripts } from "@/utils/installationUtils";
import { toast } from "sonner";

// Composants pour les différentes étapes
import { HardwareDetection } from "@/components/ai-installer/HardwareDetection";
import { SystemRequirements } from "@/components/ai-installer/SystemRequirements";
import { OllamaDetector } from "@/components/config/llm/components/OllamaDetector";

export default function LocalAISetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const { capabilities, isLoading } = useSystemCapabilities();
  const [isOllamaReady, setIsOllamaReady] = useState(false);
  const [isInstallationComplete, setIsInstallationComplete] = useState(false);
  
  const steps = [
    "Vérification système",
    "Prérequis",
    "Installation",
    "Configuration"
  ];
  
  useEffect(() => {
    // Vérifier si Ollama est déjà installé au chargement
    const checkOllamaStatus = async () => {
      const isAvailable = await isOllamaAvailable();
      if (isAvailable) {
        setIsOllamaReady(true);
        // Si Ollama est déjà installé, on peut passer à l'étape de configuration
        if (currentStep < 3) {
          setCurrentStep(3);
        }
      }
    };
    
    checkOllamaStatus();
  }, [currentStep]);
  
  const handleConfigureOllama = () => {
    configureOllama();
    setIsInstallationComplete(true);
    toast.success("IA locale configurée avec succès");
  };
  
  const handleDownloadScripts = async () => {
    try {
      await downloadInstallationScripts();
      toast.success("Scripts d'installation téléchargés. Exécutez-les pour installer Ollama.");
    } catch (error) {
      toast.error("Erreur lors du téléchargement des scripts");
      console.error(error);
    }
  };
  
  // Rendu en fonction de l'état d'achèvement
  if (isInstallationComplete) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center mb-8">
          <ServerIcon className="h-16 w-16 mx-auto mb-4 text-green-600" />
          <h1 className="text-2xl font-bold mb-4">Installation IA locale terminée</h1>
          <p className="text-gray-600 mb-8 max-w-lg mx-auto">
            L'IA locale est configurée et prête à être utilisée. Vous pouvez maintenant discuter avec votre assistant IA local directement dans l'application.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate("/chat")} className="gap-2">
              <Home className="h-4 w-4" />
              Aller au chat
            </Button>
            <Button variant="outline" onClick={() => setIsInstallationComplete(false)}>
              Réinstaller
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Installation de l'IA locale</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Installez l'IA locale sur votre ordinateur pour bénéficier de confidentialité totale et d'un fonctionnement hors-ligne
        </p>
      </div>
      
      <div className="flex justify-center mb-8">
        <Steps 
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => {
            // Permettre de retourner à des étapes précédentes
            if (step < currentStep) {
              setCurrentStep(step);
            }
          }}
        />
      </div>
      
      <div className="max-w-3xl mx-auto mb-8">
        <h2 className="text-xl font-semibold mb-4">{steps[currentStep]}</h2>
        
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Pourquoi installer l'IA locale?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>Confidentialité maximale</strong> - Vos données restent sur votre ordinateur</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>Utilisation hors-ligne</strong> - Fonctionne sans connexion Internet</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>Contrôle total</strong> - Personnalisez vos modèles selon vos besoins</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">✓</span>
                  <span><strong>Aucun coût</strong> - Pas de frais d'API ni de limites d'utilisation</span>
                </li>
              </ul>
            </div>
            
            <HardwareDetection 
              capabilities={capabilities} 
              isLoading={isLoading} 
              onReady={() => setCurrentStep(1)} 
            />
          </div>
        )}
        
        {currentStep === 1 && (
          <SystemRequirements onContinue={() => setCurrentStep(2)} />
        )}
        
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border mb-4">
              <h3 className="font-medium mb-2">Installer Ollama</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ollama est un logiciel léger qui permet d'exécuter des modèles d'IA sur votre ordinateur.
                Téléchargez et installez-le pour commencer à utiliser l'IA locale.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleDownloadScripts}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Télécharger le script d'installation
                </Button>
                
                <a 
                  href="https://ollama.ai/download" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button variant="outline">
                    Télécharger manuellement
                  </Button>
                </a>
              </div>
            </div>
            
            <div className="mt-4">
              <Button onClick={() => setCurrentStep(3)}>
                Continuer vers la configuration
              </Button>
            </div>
          </div>
        )}
        
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="mb-4">
              <OllamaDetector 
                onOllamaDetected={setIsOllamaReady} 
                onConfigureOllama={handleConfigureOllama}
              />
            </div>
            
            {isOllamaReady && (
              <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                <h3 className="font-medium mb-2">Modèles recommandés</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Selon les capacités de votre système, voici les modèles recommandés:
                </p>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Mistral 7B</h4>
                        <p className="text-xs text-gray-500">4-8 GB de RAM | ~4 GB d'espace disque</p>
                        <p className="text-xs text-gray-600 mt-1">Recommandé pour les systèmes standards</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          // Commander à Ollama de télécharger Mistral
                          window.open('ollama://install/mistral', '_blank');
                        }}
                      >
                        Installer
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">Llama 3 8B</h4>
                        <p className="text-xs text-gray-500">8-16 GB de RAM | ~4 GB d'espace disque</p>
                        <p className="text-xs text-gray-600 mt-1">Excellent équilibre performance/ressources</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          window.open('ollama://install/llama3', '_blank');
                        }}
                      >
                        Installer
                      </Button>
                    </div>
                  </div>
                  
                  {capabilities.memoryInGB && capabilities.memoryInGB >= 16 && (
                    <div className="bg-white p-3 rounded border">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">Mixtral 8x7B</h4>
                          <p className="text-xs text-gray-500">16+ GB de RAM | ~15 GB d'espace disque</p>
                          <p className="text-xs text-gray-600 mt-1">Performances supérieures, proche des modèles cloud</p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => {
                            window.open('ollama://install/mixtral', '_blank');
                          }}
                        >
                          Installer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="text-center mt-8">
              <Button 
                onClick={handleConfigureOllama} 
                disabled={!isOllamaReady}
                size="lg"
              >
                Terminer la configuration
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
