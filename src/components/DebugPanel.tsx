
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bug } from "lucide-react";
import { useDiagnostics } from '@/hooks/useDiagnostics';
import { useHuggingFace } from '@/hooks/useHuggingFace';
import { DebugPanelContent } from './debug/DebugPanelContent';
import { BrowserCompatibilityAlert } from './debug/BrowserCompatibilityAlert';
import { checkBrowserCompatibility } from '@/hooks/ai/analyzers/browserCompatibility';

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isRunning, report, runDiagnostic } = useDiagnostics();
  const { serviceType, localAIUrl, localProvider } = useHuggingFace();
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([]);
  const [isCritical, setIsCritical] = useState(false);

  // Uniquement en développement ou si l'URL contient un paramètre debug=true
  const shouldShow = import.meta.env.DEV || window.location.search.includes('debug=true');
  
  // Check compatibility on mount
  useEffect(() => {
    const { issues, compatible } = checkBrowserCompatibility();
    setCompatibilityIssues(issues);
    setIsCritical(!compatible);
  }, []);

  if (!shouldShow && !isCritical) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="icon"
            className="fixed bottom-4 right-4 z-50 rounded-full h-10 w-10 bg-white/80 backdrop-blur-sm hover:bg-white dark:bg-gray-800/80 dark:hover:bg-gray-800"
          >
            <Bug className="h-5 w-5" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Console de Diagnostic FileChat</DialogTitle>
            <DialogDescription>
              Outils de diagnostic et de débogage pour l'équipe technique
            </DialogDescription>
          </DialogHeader>

          <DebugPanelContent 
            isRunning={isRunning}
            report={report}
            runDiagnostic={runDiagnostic}
            serviceType={serviceType}
            localAIUrl={localAIUrl}
            localProvider={localProvider}
          />
        </DialogContent>
      </Dialog>
      
      {/* Alerte de compatibilité du navigateur - toujours affichée si critique */}
      <BrowserCompatibilityAlert 
        issues={compatibilityIssues} 
        forceShow={isCritical} 
      />
    </>
  );
};
