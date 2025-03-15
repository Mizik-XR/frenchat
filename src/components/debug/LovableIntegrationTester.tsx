
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { checkLovableIntegration, ensureLovableIntegration } from '@/utils/lovable/lovableIntegrationCheck';
import { toast } from '@/hooks/use-toast';

export function LovableIntegrationTester() {
  const [isIntegrated, setIsIntegrated] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkIntegration();
  }, []);

  const checkIntegration = () => {
    setIsChecking(true);
    setTimeout(() => {
      const result = checkLovableIntegration();
      setIsIntegrated(result);
      setIsChecking(false);
    }, 1000);
  };

  const fixIntegration = () => {
    ensureLovableIntegration();
    toast({
      title: "Réparation tentée",
      description: "Veuillez rafraîchir la page pour vérifier si le problème est résolu.",
      variant: "default"
    });
    checkIntegration();
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium">Diagnostic d'intégration Lovable</h3>
      
      {isChecking ? (
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
          <span>Vérification en cours...</span>
        </div>
      ) : isIntegrated === null ? (
        <Alert>
          <AlertTitle>Diagnostic non effectué</AlertTitle>
          <AlertDescription>
            Cliquez sur le bouton ci-dessous pour vérifier l'intégration Lovable.
          </AlertDescription>
        </Alert>
      ) : isIntegrated ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <AlertTitle>Intégration fonctionnelle</AlertTitle>
          <AlertDescription>
            L'intégration Lovable est correctement configurée.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <XCircle className="h-5 w-5" />
          <AlertTitle>Problème d'intégration détecté</AlertTitle>
          <AlertDescription>
            L'intégration Lovable ne fonctionne pas correctement. Essayez de réparer et de rafraîchir la page.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex space-x-2">
        <Button onClick={checkIntegration} variant="outline" disabled={isChecking}>
          {isChecking ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Vérification...
            </>
          ) : (
            <>Vérifier l'intégration</>
          )}
        </Button>
        <Button onClick={fixIntegration} variant="default" disabled={isChecking || isIntegrated === true}>
          Tenter de réparer
        </Button>
        <Button onClick={() => window.location.reload()} variant="secondary">
          Rafraîchir la page
        </Button>
      </div>
    </div>
  );
}
