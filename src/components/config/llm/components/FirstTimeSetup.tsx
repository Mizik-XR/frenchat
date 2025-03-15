
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit, Info } from "lucide-react";
import { LogoImage } from "@/components/common/LogoImage";
import { Progress } from "@/components/ui/progress";
import { useSystemCapabilities } from "@/hooks/useSystemCapabilities";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FirstTimeSetupProps {
  onActivate: () => Promise<void>;
  isConfiguring: boolean;
}

export function FirstTimeSetup({ onActivate, isConfiguring }: FirstTimeSetupProps) {
  const [setupProgress, setSetupProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const { capabilities, isLoading: isCapabilitiesLoading } = useSystemCapabilities();

  // Simulation de l'analyse du système
  useEffect(() => {
    if (isCapabilitiesLoading || !capabilities) return;
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setSetupProgress(progress);
      
      if (progress <= 25) {
        setProgressText("Analyse du matériel...");
      } else if (progress <= 50) {
        setProgressText("Détection des capacités IA...");
      } else if (progress <= 75) {
        setProgressText("Sélection du modèle optimal...");
      } else if (progress < 100) {
        setProgressText("Finalisation de l'analyse...");
      } else {
        setProgressText("Analyse complétée");
        clearInterval(interval);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [capabilities, isCapabilitiesLoading]);

  // Déterminer la recommandation de modèle basée sur les capacités
  const getRecommendedModelInfo = () => {
    if (!capabilities) return { name: "Mistral 7B", desc: "Modèle équilibré" };
    
    if (capabilities.hasGpu && capabilities.memoryInGB > 16) {
      return { 
        name: "Mixtral 8x7B", 
        desc: "Modèle haute performance recommandé pour votre configuration" 
      };
    } else if (capabilities.memoryInGB >= 8) {
      return { 
        name: "Mistral 7B", 
        desc: "Modèle bien adapté à votre configuration" 
      };
    } else {
      return { 
        name: "Mistral 7B (quantifié)", 
        desc: "Version optimisée pour économiser la mémoire" 
      };
    }
  };

  const recommendedModel = getRecommendedModelInfo();

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-md overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <LogoImage className="h-12 w-12" />
            <h2 className="text-2xl font-bold text-purple-900">FileChat</h2>
          </div>
          
          <div className="p-3 bg-purple-100 rounded-full">
            <BrainCircuit className="h-8 w-8 text-purple-700" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-purple-900">Premier démarrage</h3>
            <p className="text-purple-700">
              Nous avons détecté votre configuration système et sélectionné le meilleur modèle IA pour votre matériel.
            </p>
          </div>
          
          {!isCapabilitiesLoading && setupProgress < 100 ? (
            <div className="w-full space-y-2">
              <Progress value={setupProgress} className="w-full h-2" />
              <p className="text-sm text-purple-600">{progressText}</p>
            </div>
          ) : (
            <>
              <div className="bg-white/50 p-4 rounded-lg shadow-sm w-full">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-purple-900">Modèle recommandé</h4>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowSystemInfo(!showSystemInfo)}
                    className="text-purple-700 hover:text-purple-900"
                  >
                    <Info className="h-4 w-4 mr-1" />
                    Détails
                  </Button>
                </div>
                <div className="text-left">
                  <p className="font-medium text-purple-900">{recommendedModel.name}</p>
                  <p className="text-sm text-purple-700">{recommendedModel.desc}</p>
                </div>
              </div>
              
              {showSystemInfo && capabilities && (
                <Alert className="bg-blue-50 border-blue-200 text-left">
                  <AlertDescription>
                    <ul className="text-sm space-y-1 text-blue-800">
                      <li><strong>Processeur:</strong> {capabilities.cpuInfo || "Non détecté"}</li>
                      <li><strong>Mémoire:</strong> {capabilities.memoryInGB || 0} Go</li>
                      <li><strong>GPU:</strong> {capabilities.hasGpu ? capabilities.gpuInfo || "Détecté" : "Non détecté"}</li>
                      <li><strong>Navigateur:</strong> {capabilities.browserInfo || "Non détecté"}</li>
                      <li><strong>Mode recommandé:</strong> {capabilities.recommendedMode || "Hybride"}</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
          
          <Button
            onClick={onActivate}
            disabled={isConfiguring || setupProgress < 100}
            className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
          >
            {isConfiguring ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/60 border-t-white" />
                Activation en cours...
              </div>
            ) : (
              "Activer la configuration recommandée"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
