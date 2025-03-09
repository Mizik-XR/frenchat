
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SentryTestButton } from '@/components/debug/SentryTestButton';

interface SystemLogsCardProps {
  logs: string[];
  onRunDiagnostic: () => void;
  onClearLogs: () => void;
}

export const SystemLogsCard = ({ 
  logs, 
  onRunDiagnostic, 
  onClearLogs 
}: SystemLogsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs système</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm h-[300px] overflow-y-auto mb-4">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))
          ) : (
            <div className="text-gray-500">Aucun log disponible</div>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <Button onClick={onRunDiagnostic}>
            Lancer un diagnostic
          </Button>
          <Button variant="outline" onClick={onClearLogs}>
            Effacer les logs
          </Button>
          <SentryTestButton />
        </div>
      </CardContent>
    </Card>
  );
};
