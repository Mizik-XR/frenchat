
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
  const [authKey, setAuthKey] = useState<string | null>(null);

  // Restreindre l'accès uniquement en développement avec une clé d'authentification
  const isDevMode = import.meta.env.DEV;
  const hasDebugParam = window.location.search.includes('debug=true');
  const hasAuthParam = new URLSearchParams(window.location.search).get('auth_key');
  
  // La clé d'authentification correcte (en production, cela devrait être stocké de manière sécurisée)
  const validAuthKey = import.meta.env.VITE_DEBUG_AUTH_KEY || 'filechat-debug-9a7b3c';
  
  // Vérifier si l'accès au débogage est autorisé
  const isDebugAllowed = isDevMode || (hasDebugParam && hasAuthParam === validAuthKey);
  
  useEffect(() => {
    // Stocker la clé d'authentification dans le state si elle est valide
    if (hasAuthParam && hasAuthParam === validAuthKey) {
      setAuthKey(hasAuthParam);
    }
    
    // Vérifier la compatibilité du navigateur
    const { issues, compatible } = checkBrowserCompatibility();
    setCompatibilityIssues(issues);
    setIsCritical(!compatible);
  }, [hasAuthParam, validAuthKey]);

  // Ne rien afficher si l'accès n'est pas autorisé, sauf en cas de problème critique
  if (!isDebugAllowed && !isCritical) return null;

  return (
    <>
      {isDebugAllowed && (
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
      )}
      
      {/* Alerte de compatibilité du navigateur - toujours affichée si critique */}
      <BrowserCompatibilityAlert 
        issues={compatibilityIssues} 
        forceShow={isCritical} 
      />
    </>
  );
};
