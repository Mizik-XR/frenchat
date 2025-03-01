
import { Cpu, Cloud } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AIServiceSectionProps {
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
}

export const AIServiceSection = ({ aiService }: AIServiceSectionProps) => {
  return (
    <div>
      <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
        Services IA
      </h4>
      <div className="space-y-3">
        <div className="border rounded p-3 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Local ({aiService.local.provider})</span>
            </div>
            {aiService.local.available ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">Disponible</Badge>
            ) : (
              <Badge variant="destructive">Indisponible</Badge>
            )}
          </div>
          {aiService.local.available && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div>Temps de réponse: {aiService.local.responseTime}ms</div>
              <div className="font-mono text-xs truncate">Endpoint: {aiService.local.endpoint}</div>
            </div>
          )}
        </div>
        
        <div className="border rounded p-3 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Cloud</span>
            </div>
            {aiService.cloud.available ? (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">Disponible</Badge>
            ) : (
              <Badge variant="destructive">Indisponible</Badge>
            )}
          </div>
          {aiService.cloud.available && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <div>Temps de réponse: {aiService.cloud.responseTime}ms</div>
            </div>
          )}
        </div>
        
        <div className="text-sm">
          <span className="font-medium">Mode recommandé: </span>
          <Badge
            variant="outline"
            className={`ml-1 ${aiService.recommendedMode === 'local' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}`}
          >
            {aiService.recommendedMode.charAt(0).toUpperCase() + aiService.recommendedMode.slice(1)}
          </Badge>
        </div>
      </div>
    </div>
  );
};
