
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SentryTestButton } from '@/components/debug/SentryTestButton';
import { useToast } from '@/hooks/use-toast';

interface MonitoringStatusProps {
  sentryStat: {
    initialized: boolean;
    dsn: string;
    environment: string;
  };
}

export const MonitoringStatusCard = ({ sentryStat }: MonitoringStatusProps) => {
  const { toast } = useToast();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>État du monitoring</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-800">
            <h3 className="font-medium mb-2">Sentry</h3>
            <div className="text-sm space-y-1">
              <p>État: <span className={`font-mono ${sentryStat.initialized ? 'text-green-600' : 'text-red-600'}`}>
                {sentryStat.initialized ? 'Initialisé' : 'Non initialisé'}
              </span></p>
              <p>DSN: <span className="font-mono">{sentryStat.dsn}</span></p>
              <p>Env: <span className="font-mono">{sentryStat.environment}</span></p>
            </div>
          </div>
          
          <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-800">
            <h3 className="font-medium mb-2">Console Errors</h3>
            <p className="text-sm">Pour voir les erreurs récentes:</p>
            <div className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded font-mono text-xs">
              window.printFileCharErrorLogs()
            </div>
          </div>
          
          <div className="p-4 rounded-md bg-gray-100 dark:bg-gray-800">
            <h3 className="font-medium mb-2">Actions</h3>
            <div className="space-y-2">
              <SentryTestButton />
              <Button 
                variant="outline" 
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  if (window.printFileCharErrorLogs) {
                    const count = window.printFileCharErrorLogs();
                    toast({
                      title: `${count} logs affichés`,
                      description: "Consultez la console pour voir les logs d'erreur",
                    });
                  }
                }}
              >
                Afficher tous les logs
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
