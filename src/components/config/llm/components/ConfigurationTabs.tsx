
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ModelPathSelector } from "./ModelPathSelector";
import { AIDocumentation } from "./AIDocumentation";

interface ConfigurationTabsProps {
  localModelPath: string;
  defaultModelPath: string;
  onPathChange: (path: string) => void;
  onPathSelect: () => void;
  onDownloadCompanion: () => void;
  onOpenWizard: () => void;
}

export function ConfigurationTabs({
  localModelPath,
  defaultModelPath,
  onPathChange,
  onPathSelect,
  onDownloadCompanion,
  onOpenWizard
}: ConfigurationTabsProps) {
  return (
    <Tabs defaultValue="configuration" className="mt-4">
      <TabsList className="mb-2">
        <TabsTrigger value="configuration">Configuration</TabsTrigger>
        <TabsTrigger value="documentation">Documentation</TabsTrigger>
      </TabsList>
      
      <TabsContent value="configuration">
        <ModelPathSelector
          modelPath={localModelPath}
          defaultModelPath={defaultModelPath}
          onPathChange={onPathChange}
          onPathSelect={onPathSelect}
          onDownloadCompanion={onDownloadCompanion}
          onOpenWizard={onOpenWizard}
        />
      </TabsContent>
      
      <TabsContent value="documentation">
        <AIDocumentation />
      </TabsContent>
    </Tabs>
  );
}
