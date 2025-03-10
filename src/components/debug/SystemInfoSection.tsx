
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Cpu } from "lucide-react";

interface SystemInfoSectionProps {
  system: {
    browser: string;
    networkType?: string;
    networkSpeed?: 'slow' | 'medium' | 'fast';
    capabilities: Record<string, boolean>;
    memory: {
      totalJSHeapSize?: number;
      usedJSHeapSize?: number;
      jsHeapSizeLimit?: number;
    };
    gpuAvailable?: boolean;
    gpuInfo?: string;
    systemScore?: number;
  };
}

export const SystemInfoSection = ({ system }: SystemInfoSectionProps) => {
  return (
    <div>
      <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
        Information système
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Navigateur:</span>
          <span>{system.browser}</span>
        </div>
        <div className="flex justify-between">
          <span>Type de réseau:</span>
          <span>{system.networkType || 'Non détecté'}</span>
        </div>
        <div className="flex justify-between">
          <span>Vitesse réseau:</span>
          <Badge variant={
            system.networkSpeed === 'fast' ? 'default' :
            system.networkSpeed === 'medium' ? 'default' : 'outline'
          } className={
            system.networkSpeed === 'fast' ? 'bg-green-500 hover:bg-green-600' : 
            system.networkSpeed === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''
          }>
            {system.networkSpeed === 'fast' ? 'Rapide' :
             system.networkSpeed === 'medium' ? 'Moyenne' : 'Lente'}
          </Badge>
        </div>
        
        {/* Section GPU */}
        <div className="border-t pt-2 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-4 w-4 text-blue-500" />
            <div className="font-medium">Processeur & GPU:</div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span>GPU disponible:</span>
              {system.gpuAvailable ? (
                <Badge variant="default" className="bg-green-500 hover:bg-green-600">Oui</Badge>
              ) : (
                <Badge variant="outline">Non</Badge>
              )}
            </div>
            {system.systemScore !== undefined && (
              <div className="flex justify-between">
                <span>Score système:</span>
                <span className="font-semibold">{Math.round(system.systemScore * 100)}%</span>
              </div>
            )}
          </div>
          {system.gpuInfo && (
            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              {system.gpuInfo}
            </div>
          )}
        </div>
        
        {system.memory.jsHeapSizeLimit && (
          <div className="border-t pt-2 mt-2">
            <div className="font-medium mb-1">Mémoire JavaScript:</div>
            <div className="grid grid-cols-3 gap-1">
              <div className="border rounded p-2 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">Utilisée</div>
                <div>{Math.round(system.memory.usedJSHeapSize! / (1024 * 1024))} MB</div>
              </div>
              <div className="border rounded p-2 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                <div>{Math.round(system.memory.totalJSHeapSize! / (1024 * 1024))} MB</div>
              </div>
              <div className="border rounded p-2 text-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">Limite</div>
                <div>{Math.round(system.memory.jsHeapSizeLimit! / (1024 * 1024))} MB</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="border-t pt-2 mt-2">
          <div className="font-medium mb-1">Fonctionnalités supportées:</div>
          <div className="grid grid-cols-2 gap-1">
            {Object.entries(system.capabilities).map(([key, value]) => (
              <div key={key} className="flex items-center gap-1">
                {value ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span className="text-xs">{key}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
