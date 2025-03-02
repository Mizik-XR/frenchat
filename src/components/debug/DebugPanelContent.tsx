
import { Button } from "@/components/ui/button";
import { Terminal } from "lucide-react";
import { SystemStatusCard } from "./SystemStatusCard";
import { DiagnosticReport } from "./DiagnosticReport";

interface DebugPanelContentProps {
  isRunning: boolean;
  report: any;
  runDiagnostic: () => void;
  serviceType: string;
  localAIUrl: string | null;
  localProvider: string;
}

export const DebugPanelContent = ({ 
  isRunning, 
  report, 
  runDiagnostic,
  serviceType,
  localAIUrl,
  localProvider
}: DebugPanelContentProps) => {
  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-semibold">État du système</h3>
        <Button 
          onClick={runDiagnostic} 
          disabled={isRunning}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Terminal className="h-4 w-4" />
          {isRunning ? "Diagnostic en cours..." : "Lancer un diagnostic"}
        </Button>
      </div>

      <SystemStatusCard 
        serviceType={serviceType}
        localAIUrl={localAIUrl}
        localProvider={localProvider}
      />

      {report && <DiagnosticReport report={report} />}
      
      <div className="text-center text-xs text-gray-500 mt-6">
        Console de débogage - Version {import.meta.env.VITE_LOVABLE_VERSION || '1.0.0'}
      </div>
    </div>
  );
};
