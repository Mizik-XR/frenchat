
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
import { toast } from '@/hooks/use-toast';

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isRunning, report, runDiagnostic } = useDiagnostics();
  const { serviceType, localAIUrl, localProvider } = useHuggingFace();
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([]);
  const [isCritical, setIsCritical] = useState(false);
  const [authKey, setAuthKey] = useState<string | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);

  // Restreindre l'accès uniquement en développement avec une clé d'authentification
  // Clé d'authentification encore plus sécurisée (plus longue, avec caractères spéciaux)
  const validAuthKey = import.meta.env.VITE_DEBUG_AUTH_KEY || 'filechat-debug-j8H2p!9a7b3c$5dEx';
  
  // Vérifier les paramètres d'URL
  const hasDebugParam = window.location.search.includes('debug=true');
  const urlAuthKey = new URLSearchParams(window.location.search).get('auth_key');
  
  // Vérifier si l'accès au débogage est autorisé - BEAUCOUP plus restrictif
  const isDevMode = import.meta.env.DEV;
  const isDebugAllowed = (isDevMode && urlAuthKey === validAuthKey) || 
                         (hasDebugParam && urlAuthKey === validAuthKey);
  
  useEffect(() => {
    // Vérifier la compatibilité du navigateur
    const { issues, compatible } = checkBrowserCompatibility();
    setCompatibilityIssues(issues);
    setIsCritical(!compatible);
    
    // Vérifier l'authentification
    if (urlAuthKey) {
      if (urlAuthKey === validAuthKey) {
        setAuthKey(urlAuthKey);
      } else if (!authAttempted) {
        // Enregistrer la tentative d'authentification échouée
        setAuthAttempted(true);
        toast({
          title: "Accès refusé",
          description: "Vous n'êtes pas autorisé à accéder aux outils de débogage.",
          variant: "destructive"
        });
        
        // Supprimer les paramètres d'URL pour cacher la tentative
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, [urlAuthKey, validAuthKey, authAttempted]);

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
        clientMode={!isDebugAllowed}
      />
    </>
  );
};
