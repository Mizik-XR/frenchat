
import React from 'react';
import { Button } from '@/components/ui/button';
import { BugPlay } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSentrySession } from '@/components/monitoring/error-monitor/useSentrySession';

/**
 * Component that provides a button to test Sentry error reporting
 */
export const SentryTestButton = () => {
  const { captureException } = useSentrySession();

  const handleTestSentry = () => {
    try {
      toast({
        title: "Test Sentry",
        description: "Envoi d'une erreur test à Sentry...",
      });
      
      // Generate a test error
      throw new Error(`Test Sentry Error - ${new Date().toISOString()}`);
    } catch (error) {
      if (error instanceof Error) {
        console.log("Erreur de test capturée, envoi à Sentry...");
        
        // Send to Sentry with context data
        captureException(error, {
          source: "SentryTestButton",
          manual: true,
          timestamp: Date.now(),
          userAction: "Test Button Click"
        });
        
        toast({
          title: "Erreur envoyée à Sentry",
          description: "Vérifiez le dashboard Sentry pour confirmer la réception.",
          variant: "default" 
        });
      }
    }
  };

  return (
    <Button 
      onClick={handleTestSentry} 
      variant="outline"
      className="bg-red-50 hover:bg-red-100 border-red-200 text-red-600 hover:text-red-700"
    >
      <BugPlay className="mr-2 h-4 w-4" />
      Tester Sentry
    </Button>
  );
};
