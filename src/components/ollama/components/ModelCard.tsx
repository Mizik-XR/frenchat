
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, CheckCircle, AlertTriangle } from "lucide-react";
import { ModelInfo } from "../data/modelData";
import { SystemCapabilities } from "@/types/system";
import { isModelCompatible } from "../utils/modelUtils";

interface ModelCardProps {
  model: ModelInfo;
  systemCapabilities: SystemCapabilities;
  isInstalled: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  onDownload: (modelId: string) => void;
}

const ModelCard = ({
  model,
  systemCapabilities,
  isInstalled,
  isDownloading,
  downloadProgress,
  onDownload,
}: ModelCardProps) => {
  const compatible = isModelCompatible(model, systemCapabilities);

  return (
    <div 
      className={`border rounded-lg p-4 ${!compatible ? 'opacity-60' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{model.name}</h3>
        <div className="text-sm text-gray-500">{model.size}</div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{model.description}</p>
      
      <div className="flex flex-wrap gap-1 mb-3">
        {model.tags.map(tag => (
          <span 
            key={tag} 
            className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          RAM: {model.requirements.memory} | Disque: {model.requirements.disk}
          {model.requirements.gpu && " | GPU requis"}
        </div>
        
        {isInstalled ? (
          <Button variant="outline" size="sm" disabled className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Installé
          </Button>
        ) : isDownloading ? (
          <div className="w-32">
            <Progress value={downloadProgress} className="h-2 mb-1" />
            <div className="text-xs text-center">{downloadProgress}%</div>
          </div>
        ) : (
          <Button
            size="sm"
            onClick={() => onDownload(model.id)}
            disabled={!compatible}
            className="gap-1"
          >
            <Download className="h-3 w-3" />
            Installer
          </Button>
        )}
      </div>
      
      {!compatible && (
        <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
          <AlertTriangle className="h-3 w-3" />
          Non compatible avec votre système
        </div>
      )}
    </div>
  );
};

export default ModelCard;
