import { models } from "../data/modelData";
import { getFilteredModels, filterModelsByCategory } from "../utils/modelUtils";
import ModelCard from "./ModelCard";
import { SystemCapabilities } from "@/types/system";

interface ModelListProps {
  activeTab: string;
  systemCapabilities: SystemCapabilities;
  installedModels: string[];
  downloadingModel: string | null;
  downloadProgress: number;
  onDownload: (modelId: string) => void;
}

const ModelList = ({
  activeTab,
  systemCapabilities,
  installedModels,
  downloadingModel,
  downloadProgress,
  onDownload,
}: ModelListProps) => {
  const filteredModels = getFilteredModels(models, systemCapabilities);
  const displayedModels = filterModelsByCategory(filteredModels, activeTab);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {displayedModels.map(model => (
        <ModelCard
          key={model.id}
          model={model}
          systemCapabilities={systemCapabilities}
          isInstalled={installedModels.includes(model.id)}
          isDownloading={downloadingModel === model.id}
          downloadProgress={downloadProgress}
          onDownload={onDownload}
        />
      ))}
    </div>
  );
};

export default ModelList;
