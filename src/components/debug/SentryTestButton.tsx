
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons';

interface SentryTestButtonProps {
  isEnabled: boolean;
}

/**
 * Bouton de test pour Sentry avec gestion améliorée des erreurs
 */
const SentryTestButton: React.FC<SentryTestButtonProps> = ({ isEnabled }) => {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testSentry = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      if (!isEnabled) {
        setTestResult({
          success: false,
          message: "Sentry est désactivé. Activez-le dans les paramètres pour tester."
        });
        return;
      }
      
      // Vérifier si la fonction d'initialisation de Sentry est disponible
      if (typeof window.Sentry?.captureException === 'function') {
        // Créer une erreur de test
        const testError = new Error("Test d'erreur Sentry depuis l'interface de diagnostic");
        testError.name = "SentryTestError";
        
        // Envoyer l'erreur à Sentry
        window.Sentry.captureException(testError);
        
        setTestResult({
          success: true,
          message: "Test d'erreur envoyé à Sentry avec succès."
        });
      } else {
        setTestResult({
          success: false,
          message: "Le SDK Sentry n'a pas été initialisé correctement."
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `Erreur lors du test Sentry: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={testSentry}
        disabled={isLoading}
        className={`${!isEnabled ? 'opacity-50' : ''}`}
      >
        {isLoading ? "Envoi en cours..." : "Tester Sentry"}
      </Button>
      
      {testResult && (
        <div className={`text-sm p-2 rounded-md ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {testResult.success ? (
            <InfoCircledIcon className="inline-block mr-1" />
          ) : (
            <ExclamationTriangleIcon className="inline-block mr-1" />
          )}
          {testResult.message}
        </div>
      )}
    </div>
  );
};

// Ajouter une déclaration de type global pour Sentry
declare global {
  interface Window {
    Sentry?: {
      captureException: (error: Error) => void;
    };
  }
}

export default SentryTestButton;
