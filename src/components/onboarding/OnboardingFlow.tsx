
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useSystemCapabilities } from "@/hooks/useSystemCapabilities";
import { useNavigate } from "react-router-dom";
import { Bot, Database, Server, Monitor, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

export const OnboardingFlow = () => {
  const { completeOnboarding } = useOnboarding();
  const { capabilities } = useSystemCapabilities();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Bienvenue dans FileChat",
      description: "FileChat vous permet d'interroger vos documents et d'obtenir des réponses précises grâce à l'intelligence artificielle.",
      icon: <Bot className="h-16 w-16 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-500">
            Découvrez une nouvelle façon d'interagir avec vos documents et de générer du contenu 
            à partir de vos données. Nous allons vous guider à travers quelques étapes simples 
            pour configurer votre expérience.
          </p>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Utilisation de modèles d'IA locaux ou cloud</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Connexion à vos sources de données (Google Drive, etc.)</span>
          </div>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Confidentialité et sécurité de vos informations</span>
          </div>
        </div>
      )
    },
    {
      title: "Configuration de l'IA",
      description: "Choisissez entre utiliser une IA locale sur votre ordinateur ou un service cloud.",
      icon: <Server className="h-16 w-16 text-purple-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-500">
            FileChat vous donne le choix entre une IA qui s'exécute localement sur votre ordinateur 
            pour une confidentialité maximale, ou un service cloud pour plus de puissance.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Card className="border-blue-200 hover:border-blue-400 cursor-pointer transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">IA Locale</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-500">
                Utilise Ollama sur votre ordinateur. Confidentialité maximale, aucune donnée n'est envoyée.
                {capabilities.memoryGB && (
                  <div className="mt-2 text-xs text-gray-400">
                    Votre système: {capabilities.memoryGB}GB RAM, {capabilities.cpuCores} cœurs
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 hover:border-purple-400 cursor-pointer transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">IA Cloud</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-500">
                Utilise des modèles hébergés comme Mistral ou OpenAI pour des performances supérieures.
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      title: "Sources de documents",
      description: "Connectez vos sources de données pour permettre à l'IA d'y accéder et de répondre à vos questions.",
      icon: <Database className="h-16 w-16 text-green-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-500">
            Connectez vos sources de documents pour permettre à FileChat d'indexer et d'analyser 
            vos fichiers afin de fournir des réponses précises et contextuelles.
          </p>
          
          <div className="grid grid-cols-1 gap-3 mt-4">
            <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
              <img src="/google-drive-icon.svg" alt="Google Drive" className="w-8 h-8 mr-3" />
              <div>
                <h4 className="font-medium">Google Drive</h4>
                <p className="text-sm text-gray-500">Connectez vos documents Google Drive</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto">
                Connecter
              </Button>
            </div>
            
            <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
              <img src="/ms-teams-icon.svg" alt="Microsoft Teams" className="w-8 h-8 mr-3" />
              <div>
                <h4 className="font-medium">Microsoft Teams</h4>
                <p className="text-sm text-gray-500">Accédez à vos fichiers et conversations Teams</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto">
                Connecter
              </Button>
            </div>
            
            <div className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-all">
              <Upload className="w-8 h-8 mr-3 text-gray-500" />
              <div>
                <h4 className="font-medium">Téléchargement manuel</h4>
                <p className="text-sm text-gray-500">Importez directement vos fichiers</p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto">
                Importer
              </Button>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Vous êtes prêt !",
      description: "Tout est configuré. Vous pouvez maintenant commencer à utiliser FileChat pour interroger vos documents.",
      icon: <Monitor className="h-16 w-16 text-blue-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-500">
            Félicitations ! Vous avez configuré FileChat et vous êtes prêt à commencer à l'utiliser.
            Voici ce que vous pouvez faire maintenant :
          </p>
          
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <span>Poser des questions sur vos documents dans le chat</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <span>Demander des résumés, analyses ou extractions d'informations</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <span>Générer des documents structurés basés sur vos données</span>
            </li>
            <li className="flex items-start gap-2">
              <ArrowRight className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <span>Configurer d'autres sources de données à tout moment</span>
            </li>
          </ul>
        </div>
      )
    }
  ];
  
  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      completeOnboarding();
      navigate("/chat");
    }
  };
  
  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  
  const handleSkip = () => {
    completeOnboarding();
    navigate("/chat");
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="border-gray-200 shadow-lg">
        <CardHeader className="text-center pb-4 border-b">
          <div className="mx-auto mb-4">
            {steps[step].icon}
          </div>
          <CardTitle className="text-2xl font-bold">{steps[step].title}</CardTitle>
          <p className="text-gray-500">{steps[step].description}</p>
        </CardHeader>
        
        <CardContent className="pt-6 pb-4">
          {steps[step].content}
        </CardContent>
        
        <CardFooter className="pt-2 pb-6 flex justify-between">
          <div>
            {step > 0 ? (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
            ) : (
              <Button variant="ghost" onClick={handleSkip}>
                Ignorer
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: steps.length }).map((_, i) => (
              <div 
                key={i} 
                className={`h-2 w-2 rounded-full ${i === step ? 'bg-blue-500' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          
          <Button onClick={handleNext}>
            {step < steps.length - 1 ? (
              <>
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            ) : "Commencer"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

function Upload(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
