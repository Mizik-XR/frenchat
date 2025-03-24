
import React from '@/core/reactInstance';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Wand2 } from "lucide-react";
import { CacheManager } from "./CacheManager";

interface ConfigurationTabsProps {
  localModelPath: string;
  defaultModelPath: string;
  onPathChange: (path: string) => void;
  onPathSelect: () => void;
  onDownloadCompanion: () => void;
  onOpenWizard: () => void;
  localAIUrl?: string | null;
}

export function ConfigurationTabs({
  localModelPath,
  defaultModelPath,
  onPathChange,
  onPathSelect,
  onDownloadCompanion,
  onOpenWizard,
  localAIUrl = null
}: ConfigurationTabsProps) {
  return (
    <Tabs defaultValue="installation">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="installation">Installation</TabsTrigger>
        <TabsTrigger value="models">Modèles</TabsTrigger>
        <TabsTrigger value="cache">Cache</TabsTrigger>
      </TabsList>

      <TabsContent value="installation" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="model-path">Chemin d'installation des modèles</Label>
          <div className="flex gap-2">
            <Input
              id="model-path"
              placeholder={defaultModelPath}
              value={localModelPath}
              onChange={(e) => onPathChange(e.target.value)}
            />
            <Button variant="outline" onClick={onPathSelect}>
              Parcourir
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Emplacement où les modèles d'IA seront stockés sur votre ordinateur.
          </p>
        </div>

        <div className="flex justify-between mt-4">
          <Button onClick={onOpenWizard} variant="outline" className="gap-2">
            <Wand2 className="h-4 w-4" />
            Assistant d'installation
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="models" className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Modèles disponibles</h3>
          <div className="grid gap-2">
            <div className="bg-gray-50 p-3 rounded-md border">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Mistral 7B Instruct</h4>
                  <p className="text-sm text-gray-500">
                    Modèle de base recommandé (~4 GB)
                  </p>
                </div>
                <Button size="sm" onClick={onDownloadCompanion} className="gap-1">
                  <Download className="h-3.5 w-3.5" />
                  Télécharger
                </Button>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-md border">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Mixtral 8x7B Instruct</h4>
                  <p className="text-sm text-gray-500">
                    Modèle plus puissant et plus lourd (~15 GB)
                  </p>
                </div>
                <Button size="sm" variant="outline" disabled className="gap-1">
                  <Download className="h-3.5 w-3.5" />
                  Bientôt disponible
                </Button>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="cache" className="space-y-4">
        <CacheManager localAIUrl={localAIUrl} />
      </TabsContent>
    </Tabs>
  );
}
