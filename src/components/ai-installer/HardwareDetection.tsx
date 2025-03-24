import { useState, useEffect  } from '@/core/reactInstance';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Cpu, HardDrive, Activity, Check } from "lucide-react";
import { SystemCapabilities } from "@/types/system";
import { cn } from "@/lib/utils";

interface HardwareDetectionProps {
  isLoading: boolean;
  capabilities?: SystemCapabilities;
  onReady: () => void;
}

export function HardwareDetection({ isLoading, capabilities, onReady }: HardwareDetectionProps) {
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [detectionComplete, setDetectionComplete] = useState(false);
  
  // Simuler la progression de la détection du matériel
  useEffect(() => {
    if (isLoading && detectionProgress < 90) {
      const interval = setInterval(() => {
        setDetectionProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      return () => clearInterval(interval);
    }
    
    if (!isLoading && !detectionComplete) {
      setDetectionProgress(100);
      setDetectionComplete(true);
    }
  }, [isLoading, detectionProgress, detectionComplete]);
  
  // Évaluer la compatibilité avec l'IA locale
  const getCompatibilityStatus = () => {
    if (!capabilities) return { compatible: false, reason: "Détection en cours..." };
    
    if (capabilities.memoryInGB < 4) {
      return { 
        compatible: false, 
        reason: "Mémoire insuffisante pour l'IA locale (minimum 4 Go recommandé)" 
      };
    }
    
    if (capabilities.cpuCores < 2) {
      return { 
        compatible: false, 
        reason: "Processeur insuffisant (minimum 2 cœurs recommandés)" 
      };
    }
    
    return { compatible: true, reason: "Votre système est compatible avec l'IA locale" };
  };
  
  const compatibility = getCompatibilityStatus();
  
  // Suggérer le meilleur modèle à utiliser
  const getSuggestedModel = () => {
    if (!capabilities) return "Mistral 7B (par défaut)";
    
    if (capabilities.hasGpu && capabilities.memoryInGB >= 16) {
      return "Mixtral 8x7B (haute performance)";
    } else if (capabilities.memoryInGB >= 8) {
      return "Mistral 7B";
    } else {
      return "Mistral 7B (quantifié 4-bit)";
    }
  };
  
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Détection du matériel</h3>
            {!detectionComplete ? (
              <div className="space-y-2">
                <Progress value={detectionProgress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Analyse de votre système en cours...
                </p>
              </div>
            ) : (
              <Alert className={cn(
                "border",
                compatibility.compatible ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
              )}>
                <AlertDescription className="text-sm">
                  {compatibility.reason}
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          {detectionComplete && capabilities && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                  <Cpu className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Processeur</p>
                    <p className="text-xs text-gray-500">
                      {capabilities.cpuInfo || `${capabilities.cpuCores || "?"} cœurs`}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                  <Activity className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Mémoire RAM</p>
                    <p className="text-xs text-gray-500">
                      {capabilities.memoryInGB || "?"} Go
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">Stockage disponible</p>
                    <p className="text-xs text-gray-500">
                      {capabilities.diskSpaceGB || "?"} Go
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                  <Activity className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">GPU</p>
                    <p className="text-xs text-gray-500">
                      {capabilities.hasGpu ? capabilities.gpuInfo || "Détecté" : "Non détecté"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-1">Modèle recommandé:</h4>
                <p className="text-blue-700">{getSuggestedModel()}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Basé sur votre configuration matérielle
                </p>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button onClick={onReady} disabled={!detectionComplete}>
                  <Check className="h-4 w-4 mr-2" />
                  Continuer l'installation
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
