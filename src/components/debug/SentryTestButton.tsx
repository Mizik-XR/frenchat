
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bug, Octagon, AlertCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSentrySession } from '@/components/monitoring/error-monitor/useSentrySession';

export const SentryTestButton = () => {
  const { toast } = useToast();
  const { testSentry, isSentryReady } = useSentrySession();
  const [isReady, setIsReady] = useState<boolean | null>(null);
  
  // Vérifie si Sentry est correctement initialisé
  const checkSentryStatus = () => {
    const ready = isSentryReady();
    setIsReady(ready);
    
    toast({
      title: ready ? "Sentry est initialisé" : "Sentry n'est pas initialisé",
      description: ready 
        ? "Vous pouvez envoyer des erreurs test à Sentry." 
        : "L'intégration Sentry n'est pas disponible actuellement.",
      variant: ready ? "default" : "destructive",
    });
    
    return ready;
  };
  
  // Test d'envoi d'erreur à Sentry
  const handleTestSentry = () => {
    const ready = checkSentryStatus();
    
    if (!ready) {
      if (typeof window !== 'undefined' && window.initSentry) {
        toast({
          title: "Tentative de réinitialisation de Sentry",
          description: "Réinitialisation de Sentry en cours...",
        });
        
        window.initSentry();
        
        // Vérifie à nouveau après réinitialisation
        setTimeout(() => {
          const nowReady = isSentryReady();
          setIsReady(nowReady);
          
          if (nowReady) {
            testSentry();
            toast({
              title: "Sentry réinitialisé avec succès",
              description: "Une erreur test a été envoyée à Sentry.",
            });
          } else {
            toast({
              title: "Échec de la réinitialisation",
              description: "Impossible d'initialiser Sentry. Vérifiez la configuration.",
              variant: "destructive",
            });
          }
        }, 1000);
        
        return;
      }
      
      toast({
        title: "Impossible de tester Sentry",
        description: "Sentry n'est pas correctement initialisé.",
        variant: "destructive",
      });
      return;
    }
    
    // Envoi du test
    testSentry();
    
    toast({
      title: "Test Sentry envoyé",
      description: "Un rapport d'erreur test a été envoyé à Sentry.",
    });
  };
  
  return (
    <Button 
      onClick={handleTestSentry}
      variant="outline"
      className={`${
        isReady === true 
          ? "bg-green-50 hover:bg-green-100 border-green-200 text-green-600" 
          : isReady === false 
            ? "bg-red-50 hover:bg-red-100 border-red-200 text-red-600"
            : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-600"
      }`}
    >
      {isReady === true ? (
        <Check className="mr-2 h-4 w-4" />
      ) : isReady === false ? (
        <AlertCircle className="mr-2 h-4 w-4" />
      ) : (
        <Bug className="mr-2 h-4 w-4" />
      )}
      Test Sentry
    </Button>
  );
};
