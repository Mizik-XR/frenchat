
import { Badge } from "@/components/ui/badge";
import { Cpu, Cloud, Database } from "lucide-react";

interface SystemStatusCardProps {
  serviceType: string;
  localAIUrl: string | null;
  localProvider: string;
}

export const SystemStatusCard = ({ serviceType, localAIUrl, localProvider }: SystemStatusCardProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-4 w-4 text-blue-500" />
          <h4 className="font-medium">Service IA</h4>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Mode actuel:</span>
            <Badge variant={serviceType === 'local' ? "default" : serviceType === 'cloud' ? "default" : "outline"} 
                  className={serviceType === 'local' ? "bg-green-500 hover:bg-green-600" : ""}>
              {serviceType === 'local' ? 'Local' : serviceType === 'cloud' ? 'Cloud' : 'Hybride'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>URL locale:</span>
            <span className="font-mono text-xs">{localAIUrl || 'Non configurée'}</span>
          </div>
          <div className="flex justify-between">
            <span>Fournisseur:</span>
            <span>{localProvider}</span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-4 w-4 text-green-500" />
          <h4 className="font-medium">Stockage</h4>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Cache activé:</span>
            <span>{localStorage.getItem('cacheEnabled') !== 'false' ? 'Oui' : 'Non'}</span>
          </div>
          <div className="flex justify-between">
            <span>Limite du cache:</span>
            <span>{localStorage.getItem('cacheLimit') || '1000'} entrées</span>
          </div>
          <div className="flex justify-between">
            <span>TTL par défaut:</span>
            <span>{localStorage.getItem('cacheTTL') || '30'} jours</span>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="h-4 w-4 text-purple-500" />
          <h4 className="font-medium">Connexion</h4>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Status:</span>
            <Badge variant={navigator.onLine ? "default" : "destructive"} 
                  className={navigator.onLine ? "bg-green-500 hover:bg-green-600" : ""}>
              {navigator.onLine ? 'Connecté' : 'Déconnecté'}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span>Type réseau:</span>
            <span>{typeof navigator !== 'undefined' && 'connection' in navigator ? (navigator as any).connection?.effectiveType || 'Inconnu' : 'Non disponible'}</span>
          </div>
          <div className="flex justify-between">
            <span>Hors-ligne:</span>
            <span>{localStorage.getItem('offlineMode') === 'true' ? 'Activé' : 'Désactivé'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
