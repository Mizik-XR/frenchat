
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { OllamaInstaller } from "@/components/ai-installer/OllamaInstaller";
import { ModelDownloader } from "@/components/ai-installer/ModelDownloader";
import { CheckCircle, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react";
import { SystemCapabilities } from "@/types/system";
import { InstallationSummary } from "./InstallationSummary";
import { toast } from "@/hooks/use-toast";
import { downloadInstallationScripts } from "@/utils/installationUtils";

interface AIInstallerWizardProps {
  capabilities?: SystemCapabilities;
  onComplete: () => void;
  onSkip: () => void;
}

export function AIInstallerWizard({ capabilities, onComplete, onSkip }: AIInstallerWizardProps) {
  const [installStep, setInstallStep] = useState<'ollama' | 'model' | 'summary'>('ollama');
  const [ollamaInstalled, setOllamaInstalled] = useState(false);
  const [modelInstalled, setModelInstalled] = useState(false);
  const [installationLogs, setInstallationLogs] = useState<string[]>([]);
  
  const addLogMessage = (message: string) => {
    setInstallationLogs(prev => [...prev, message]);
  };
  
  const handleOllamaComplete = () => {
    setOllamaInstalled(true);
    addLogMessage("✅ Installation d'Ollama terminée avec succès");
    toast({
      title: "Installation réussie",
      description: "Ollama a été installé avec succès. Passons au téléchargement du modèle.",
    });
    setInstallStep('model');
  };
  
  const handleModelComplete = () => {
    setModelInstalled(true);
    addLogMessage("✅ Téléchargement et configuration du modèle terminés");
    toast({
      title: "Modèle configuré",
      description: "Le modèle IA a été téléchargé et configuré avec succès.",
    });
    setInstallStep('summary');
  };
  
  const handleDownloadScripts = async () => {
    try {
      addLogMessage("📥 Téléchargement des scripts d'installation...");
      await downloadInstallationScripts();
      addLogMessage("✅ Scripts téléchargés avec succès");
      toast({
        title: "Scripts téléchargés",
        description: "Les scripts d'installation ont été téléchargés. Consultez votre dossier de téléchargements.",
      });
    } catch (error) {
      addLogMessage("❌ Erreur lors du téléchargement des scripts");
      toast({
        title: "Erreur de téléchargement",
        description: "Impossible de télécharger les scripts d'installation.",
        variant: "destructive",
      });
    }
  };
  
  const handleComplete = () => {
    addLogMessage("✅ Installation complète terminée");
    localStorage.setItem('aiSetupCompleted', 'true');
    localStorage.setItem('aiSetupDate', new Date().toISOString());
    onComplete();
  };
  
  return (
    <div className="space-y-6">
      {installStep === 'ollama' && (
        <OllamaInstaller 
          onComplete={handleOllamaComplete} 
          capabilities={capabilities}
          addLogMessage={addLogMessage}
        />
      )}
      
      {installStep === 'model' && (
        <ModelDownloader 
          onComplete={handleModelComplete}
          capabilities={capabilities}
          addLogMessage={addLogMessage}
        />
      )}
      
      {installStep === 'summary' && (
        <InstallationSummary 
          ollamaInstalled={ollamaInstalled}
          modelInstalled={modelInstalled}
          capabilities={capabilities}
          onComplete={handleComplete}
        />
      )}
      
      <div className="flex flex-col space-y-4">
        {/* Boutons de navigation */}
        <div className="flex justify-between">
          {installStep !== 'ollama' && (
            <Button 
              variant="outline" 
              onClick={() => setInstallStep(installStep === 'model' ? 'ollama' : 'model')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
          )}
          
          {installStep === 'ollama' && (
            <Button variant="outline" onClick={onSkip} className="ml-auto">
              Ignorer l'installation
            </Button>
          )}
        </div>
        
        {/* Journal d'installation */}
        {installationLogs.length > 0 && (
          <Card>
            <CardContent className="p-3 mt-3">
              <h3 className="text-sm font-medium mb-2">Journal d'installation</h3>
              <div className="bg-black/90 text-green-400 p-3 rounded font-mono text-xs h-24 overflow-y-auto">
                {installationLogs.map((log, index) => (
                  <div key={index} className="py-0.5">
                    {log}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Bouton pour télécharger les scripts */}
        <Button variant="outline" onClick={handleDownloadScripts} size="sm" className="ml-auto">
          Télécharger les scripts d'installation
        </Button>
      </div>
    </div>
  );
}
