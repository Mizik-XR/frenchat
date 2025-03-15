
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { checkLovableIntegration, ensureLovableIntegration, getLovableHealthStatus } from '@/utils/lovable/lovableIntegrationCheck';
import { toast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

export function LovableIntegrationTester() {
  const [isChecking, setIsChecking] = useState(false);
  const [healthStatus, setHealthStatus] = useState<ReturnType<typeof getLovableHealthStatus> | null>(null);

  useEffect(() => {
    checkIntegration();
  }, []);

  const checkIntegration = () => {
    setIsChecking(true);
    setTimeout(() => {
      const status = getLovableHealthStatus();
      setHealthStatus(status);
      setIsChecking(false);
    }, 1000);
  };

  const fixIntegration = async () => {
    setIsChecking(true);
    toast({
      title: "Tentative de réparation",
      description: "Réparation de l'intégration Lovable en cours...",
      variant: "default"
    });
    
    const result = await ensureLovableIntegration();
    
    if (result) {
      toast({
        title: "Réparation réussie",
        description: "L'intégration Lovable a été réparée avec succès.",
        variant: "success"
      });
    } else {
      toast({
        title: "Échec de la réparation",
        description: "La réparation automatique a échoué. Essayez de rafraîchir la page ou utilisez le script fix-lovable.sh/bat.",
        variant: "destructive"
      });
    }
    
    checkIntegration();
  };

  const getBadgeVariant = (status: boolean) => {
    return status ? "success" : "destructive";
  };

  const getBadgeText = (status: boolean) => {
    return status ? "OK" : "Erreur";
  };

  return (
    <Card className="border border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Diagnostic d'intégration Lovable</CardTitle>
        <CardDescription>
          Vérifie si l'édition AI via Lovable fonctionne correctement
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isChecking ? (
          <div className="flex items-center justify-center space-x-2 py-4">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            <span>Vérification en cours...</span>
          </div>
        ) : healthStatus === null ? (
          <Alert>
            <AlertTitle>Diagnostic non effectué</AlertTitle>
            <AlertDescription>
              Cliquez sur le bouton ci-dessous pour vérifier l'intégration Lovable.
            </AlertDescription>
          </Alert>
        ) : healthStatus.isFunctional ? (
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
              {healthStatus.details}
            </AlertDescription>
          </Alert>
        )}

        {healthStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex flex-col p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Script chargé</span>
                <Badge variant={getBadgeVariant(healthStatus.isScriptLoaded)}>
                  {getBadgeText(healthStatus.isScriptLoaded)}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {healthStatus.isScriptLoaded 
                  ? "gptengineer.js présent dans le DOM" 
                  : "Script manquant dans le DOM"}
              </span>
            </div>
            
            <div className="flex flex-col p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Initialisation</span>
                <Badge variant={getBadgeVariant(healthStatus.isInitialized)}>
                  {getBadgeText(healthStatus.isInitialized)}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {healthStatus.isInitialized 
                  ? "Objet global __GPT_ENGINEER__ initialisé" 
                  : "Objet global non initialisé"}
              </span>
            </div>
            
            <div className="flex flex-col p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">État général</span>
                <Badge variant={getBadgeVariant(healthStatus.isFunctional)}>
                  {getBadgeText(healthStatus.isFunctional)}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {healthStatus.isFunctional 
                  ? "L'intégration est complètement fonctionnelle" 
                  : "L'intégration n'est pas fonctionnelle"}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={checkIntegration} variant="outline" disabled={isChecking} size="sm">
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              <>Vérifier l'intégration</>
            )}
          </Button>
          <Button 
            onClick={fixIntegration} 
            variant="default" 
            disabled={isChecking || (healthStatus?.isFunctional === true)} 
            size="sm"
          >
            Tenter de réparer
          </Button>
          <Button onClick={() => window.location.reload()} variant="secondary" size="sm">
            Rafraîchir la page
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded mt-2">
          <AlertTriangle className="h-3 w-3 inline mb-1 mr-1" />
          Si les problèmes persistent après réparation, essayez d'utiliser les scripts <code>fix-lovable.sh</code> ou <code>fix-lovable.bat</code> depuis le terminal.
        </div>
      </CardContent>
    </Card>
  );
}
