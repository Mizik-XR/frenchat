
import { Button } from "@/components/ui/button";
import { Terminal, Cloud, Server, Cog } from "lucide-react";
import { SystemStatusCard } from "./SystemStatusCard";
import { DiagnosticReport } from "./DiagnosticReport";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DebugPanelContentProps {
  isRunning: boolean;
  report: any;
  runDiagnostic: () => void;
  serviceType: string;
  localAIUrl: string | null;
  localProvider: string;
  isHybridMode?: boolean;
  onToggleHybridMode?: (enabled: boolean) => void;
}

export const DebugPanelContent = ({ 
  isRunning, 
  report, 
  runDiagnostic,
  serviceType,
  localAIUrl,
  localProvider,
  isHybridMode = false,
  onToggleHybridMode
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

      <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          {serviceType === 'hybrid' ? (
            <>
              <div className="flex bg-green-100 p-1 rounded-md">
                <Server className="h-4 w-4 text-green-700" />
                <Cloud className="h-4 w-4 text-blue-700 -ml-1" />
              </div>
              <span className="font-medium">Mode Hybride</span>
            </>
          ) : serviceType === 'local' ? (
            <>
              <Server className="h-4 w-4 text-green-700" />
              <span className="font-medium">Mode Local</span>
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4 text-blue-700" />
              <span className="font-medium">Mode Cloud</span>
            </>
          )}
        </div>
        
        {onToggleHybridMode && (
          <div className="flex items-center gap-2">
            <Label htmlFor="hybrid-mode" className="text-xs">Mode Hybride</Label>
            <Switch 
              id="hybrid-mode" 
              checked={isHybridMode}
              onCheckedChange={onToggleHybridMode}
            />
          </div>
        )}
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
