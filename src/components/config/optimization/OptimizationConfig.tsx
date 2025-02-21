
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmbeddingOptimizationConfig, SearchOptimizationConfig } from "@/types/optimization";
import { OptimizationDocs } from "./OptimizationDocs";
import { toast } from "@/hooks/use-toast";

interface OptimizationConfigProps {
  embeddingConfig: EmbeddingOptimizationConfig;
  searchConfig: SearchOptimizationConfig;
  onSave: (embeddingConfig: EmbeddingOptimizationConfig, searchConfig: SearchOptimizationConfig) => Promise<void>;
}

export const OptimizationConfig = ({ 
  embeddingConfig: initialEmbeddingConfig,
  searchConfig: initialSearchConfig,
  onSave 
}: OptimizationConfigProps) => {
  const [embeddingConfig, setEmbeddingConfig] = useState(initialEmbeddingConfig);
  const [searchConfig, setSearchConfig] = useState(initialSearchConfig);

  const handleSave = async () => {
    try {
      await onSave(embeddingConfig, searchConfig);
      toast({
        title: "Configuration sauvegardée",
        description: "Les optimisations ont été mises à jour avec succès.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les optimisations.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="embeddings">
        <TabsList className="mb-6">
          <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
          <TabsTrigger value="search">Recherche</TabsTrigger>
          <TabsTrigger value="docs">Documentation</TabsTrigger>
        </TabsList>

        <TabsContent value="embeddings">
          <div className="space-y-6">
            <div>
              <Label>Taille des lots de traitement</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={embeddingConfig.batchSize}
                onChange={(e) => setEmbeddingConfig(prev => ({
                  ...prev,
                  batchSize: parseInt(e.target.value) || 1
                }))}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Nombre de documents traités simultanément (1-50)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Activer le cache</Label>
                <p className="text-sm text-gray-500">
                  Stocke les embeddings fréquents dans Supabase
                </p>
              </div>
              <Switch
                checked={embeddingConfig.cacheEnabled}
                onCheckedChange={(checked) => setEmbeddingConfig(prev => ({
                  ...prev,
                  cacheEnabled: checked
                }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Compression des données</Label>
                <p className="text-sm text-gray-500">
                  Réduit la taille des embeddings stockés
                </p>
              </div>
              <Switch
                checked={embeddingConfig.compressionEnabled}
                onCheckedChange={(checked) => setEmbeddingConfig(prev => ({
                  ...prev,
                  compressionEnabled: checked
                }))}
              />
            </div>

            <div>
              <Label>Requêtes simultanées maximum</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={embeddingConfig.maxConcurrentRequests}
                onChange={(e) => setEmbeddingConfig(prev => ({
                  ...prev,
                  maxConcurrentRequests: parseInt(e.target.value) || 1
                }))}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Limite de requêtes parallèles vers l'API (1-10)
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="search">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Utiliser les embeddings pré-calculés</Label>
                <p className="text-sm text-gray-500">
                  Accélère les recherches fréquentes
                </p>
              </div>
              <Switch
                checked={searchConfig.usePrecomputed}
                onCheckedChange={(checked) => setSearchConfig(prev => ({
                  ...prev,
                  usePrecomputed: checked
                }))}
              />
            </div>

            <div>
              <Label>Nombre maximum de résultats</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={searchConfig.maxResults}
                onChange={(e) => setSearchConfig(prev => ({
                  ...prev,
                  maxResults: parseInt(e.target.value) || 10
                }))}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Limite le nombre de résultats retournés (1-100)
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Cache des résultats</Label>
                <p className="text-sm text-gray-500">
                  Mémorise temporairement les résultats
                </p>
              </div>
              <Switch
                checked={searchConfig.resultsCaching}
                onCheckedChange={(checked) => setSearchConfig(prev => ({
                  ...prev,
                  resultsCaching: checked
                }))}
              />
            </div>

            <div>
              <Label>Durée du cache (minutes)</Label>
              <Input
                type="number"
                min="1"
                max="1440"
                value={searchConfig.cacheDuration}
                onChange={(e) => setSearchConfig(prev => ({
                  ...prev,
                  cacheDuration: parseInt(e.target.value) || 60
                }))}
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                Durée de conservation des résultats en cache (1-1440 min)
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="docs">
          <OptimizationDocs />
        </TabsContent>

        <div className="mt-6">
          <Button onClick={handleSave} className="w-full">
            Sauvegarder les optimisations
          </Button>
        </div>
      </Tabs>
    </Card>
  );
};
