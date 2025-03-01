
import { CompatibilitySection } from "./CompatibilitySection";
import { AIServiceSection } from "./AIServiceSection";
import { SystemInfoSection } from "./SystemInfoSection";

interface DiagnosticReportProps {
  report: {
    timestamp: string;
    compatibility: {
      compatible: boolean;
      issues: string[];
    };
    aiService: {
      local: {
        available: boolean;
        endpoint: string | null;
        responseTime: number | null;
        provider: string;
      };
      cloud: {
        available: boolean;
        responseTime: number | null;
      };
      recommendedMode: 'local' | 'cloud' | 'hybrid';
    };
    system: {
      browser: string;
      capabilities: Record<string, boolean>;
      memory: {
        totalJSHeapSize?: number;
        usedJSHeapSize?: number;
        jsHeapSizeLimit?: number;
      };
      networkType?: string;
      networkSpeed?: 'slow' | 'medium' | 'fast';
    };
  };
}

export const DiagnosticReport = ({ report }: DiagnosticReportProps) => {
  return (
    <div className="mt-6 border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
      <h3 className="text-lg font-semibold mb-3">Rapport de diagnostic</h3>
      
      <div className="space-y-4">
        <CompatibilitySection compatibility={report.compatibility} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIServiceSection aiService={report.aiService} />
          <SystemInfoSection system={report.system} />
        </div>
        
        <div className="text-right text-xs text-gray-500 dark:text-gray-400">
          Diagnostic généré le {new Date(report.timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};
