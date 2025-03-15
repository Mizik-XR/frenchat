
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AIInstallerWizard } from "@/components/ai-installer/AIInstallerWizard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useSystemCapabilities } from "@/hooks/useSystemCapabilities";
import { SystemRequirements } from "@/components/ai-installer/SystemRequirements";
import { HardwareDetection } from "@/components/ai-installer/HardwareDetection";

export default function LocalAISetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const { capabilities, isLoading } = useSystemCapabilities();
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Vérifier si l'utilisateur a déjà installé l'IA locale
    const isLocalAIConfigured = localStorage.getItem('aiServiceType') === 'local' && 
                               localStorage.getItem('localProvider') === 'ollama';
                               
    if (isLocalAIConfigured) {
      setIsReady(true);
    }
  }, []);
  
  const steps = [
    {
      title: "Vérification système",
      component: <HardwareDetection capabilities={capabilities} isLoading={isLoading} onReady={() => setCurrentStep(1)} />
    },
    {
      title: "Prérequis",
      component: <SystemRequirements onContinue={() => setCurrentStep(2)} />
    },
    {
      title: "Installation",
      component: <AIInstallerWizard 
                   capabilities={capabilities} 
                   onComplete={() => setIsReady(true)} 
                   onSkip={() => navigate('/chat')} 
                 />
    }
  ];

  if (isReady) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-4">Installation IA locale terminée</h1>
          <p className="text-gray-600 mb-8">
            L'IA locale est configurée et prête à être utilisée. Vous pouvez maintenant discuter avec votre assistant IA local.
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={() => navigate("/chat")} className="gap-2">
              <Home className="h-4 w-4" />
              Aller au chat
            </Button>
            <Button variant="outline" onClick={() => setIsReady(false)}>
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
          Suivez les étapes ci-dessous pour installer et configurer l'IA locale sur votre ordinateur
        </p>
      </div>
      
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div 
                className={`h-10 w-10 rounded-full flex items-center justify-center border-2 
                  ${currentStep === index 
                    ? "border-primary bg-primary text-primary-foreground" 
                    : currentStep > index 
                      ? "border-primary bg-primary/20 text-primary" 
                      : "border-gray-300 bg-gray-100 text-gray-500"}`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`h-1 w-10 
                    ${currentStep > index ? "bg-primary" : "bg-gray-300"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-center">{steps[currentStep].title}</h2>
        {steps[currentStep].component}
      </div>
    </div>
  );
}
