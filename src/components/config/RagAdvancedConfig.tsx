
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  BrainCircuit, 
  Layers, 
  Database, 
  ScrollText, 
  RefreshCw,
  HelpCircle
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SPECIALIZED_EMBEDDING_MODELS, EmbeddingModel } from "@/utils/embeddingModels";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Json } from "@/types/database";

interface RagAdvancedConfigProps {
  onSave?: () => void;
}

interface RagConfig {
  // Paramètres de chunking
  chunkSize: number;
  overlapSize: number;
  useSemanticStructure: boolean;
  respectStructure: boolean;
  
  // Paramètres d'embedding
  embeddingModel: string;
  normalizeVectors: boolean;
  
  // Paramètres de recherche
  useHybridSearch: boolean;
  useQueryClassification: boolean;
  enhanceWithMetadata: boolean;
  minSimilarityThreshold: number;
  maxResults: number;
  reranking: boolean;
  
  // Paramètres de cache
  useLocalCache: boolean;
  usePersistentCache: boolean;
  cacheTTL: number;
  compressionEnabled: boolean;
}

const defaultRagConfig: RagConfig = {
  chunkSize: 1000,
  overlapSize: 200,
  useSemanticStructure: true,
  respectStructure: true,
  
  embeddingModel: "bge-large-en-v1.5",
  normalizeVectors: true,
  
  useHybridSearch: true,
  useQueryClassification: true,
  enhanceWithMetadata: true,
  minSimilarityThreshold: 0.7,
  maxResults: 5,
  reranking: true,
  
  useLocalCache: true,
  usePersistentCache: true,
  cacheTTL: 10080, // 7 jours en minutes
  compressionEnabled: true
};

export function RagAdvancedConfig({ onSave }: RagAdvancedConfigProps) {
  const [ragConfig, setRagConfig] = useState<RagConfig>(defaultRagConfig);
  const [hasConfiguration, setHasConfiguration] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [activeTab, setActiveTab] = useState("chunking");
  
  useEffect(() => {
    loadCurrentConfig();
  }, []);
  
  const loadCurrentConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('service_configurations')
        .select('config')
        .eq('service_type', 'rag')
        .maybeSingle();
      
      if (error) throw error;
      
      if (data?.config) {
        // Faire un cast sécurisé de Json vers notre type RagConfig
        const configData = data.config as unknown;
        setRagConfig({
          ...defaultRagConfig,
          ...(configData as RagConfig)
        });
        setHasConfiguration(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration RAG:', error);
    }
  };
  
  const handleSaveConfig = async () => {
    setIsConfiguring(true);
    
    try {
      // Convert RagConfig to Json compatible object
      const configAsJson = ragConfig as unknown as Json;
      
      const { error } = await supabase
        .from('service_configurations')
        .upsert({
          service_type: 'rag',
          config: configAsJson,
          status: 'configured'
        });
      
      if (error) throw error;
      
      toast({
        title: "Configuration RAG sauvegardée",
        description: "Les paramètres RAG avancés ont été mis à jour avec succès",
      });
      
      setHasConfiguration(true);
      onSave?.();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la configuration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive"
      });
    } finally {
      setIsConfiguring(false);
    }
  };
  
  const resetToDefault = () => {
    setRagConfig(defaultRagConfig);
    toast({
      title: "Paramètres réinitialisés",
      description: "Les paramètres RAG ont été réinitialisés aux valeurs par défaut",
    });
  };
  
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuration RAG avancée</h2>
          <p className="text-sm text-gray-500">
            Optimisez les performances du Retrieval-Augmented Generation
          </p>
        </div>
        
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={resetToDefault}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Réinitialiser aux valeurs par défaut</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <BrainCircuit className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700 ml-2">
          Ces paramètres avancés permettent d'optimiser le système RAG avec un chunking intelligent, 
          des modèles d'embedding spécialisés, une stratégie de requête sophistiquée et un cache optimisé.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader className="bg-gray-50 border-b border-gray-200">
          <CardTitle>Paramètres RAG avancés</CardTitle>
          <CardDescription>
            Configurez les différents aspects du système RAG pour améliorer ses performances
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="chunking" className="flex items-center gap-2">
                <ScrollText className="h-4 w-4" />
                Chunking
              </TabsTrigger>
              <TabsTrigger value="embeddings" className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Embeddings
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4" />
                Recherche
              </TabsTrigger>
              <TabsTrigger value="cache" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Cache
              </TabsTrigger>
            </TabsList>
            
            {/* Onglet Chunking */}
            <TabsContent value="chunking" className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center">
                    Taille des chunks ({ragConfig.chunkSize} tokens)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Définit la taille maximale de chaque segment de document.
                            Une valeur plus élevée capture plus de contexte mais peut réduire la précision.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
                <Slider
                  value={[ragConfig.chunkSize]}
                  min={100}
                  max={2000}
                  step={100}
                  onValueChange={([value]) => 
                    setRagConfig(prev => ({ ...prev, chunkSize: value }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center">
                    Chevauchement ({ragConfig.overlapSize} tokens)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Définit le chevauchement entre les chunks consécutifs.
                            Aide à maintenir le contexte entre les segments.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
                <Slider
                  value={[ragConfig.overlapSize]}
                  min={0}
                  max={500}
                  step={50}
                  onValueChange={([value]) => 
                    setRagConfig(prev => ({ ...prev, overlapSize: value }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="flex items-center">
                    Chunking sémantique
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Découpe les documents selon leur structure sémantique
                            (paragraphes, sections) plutôt que par nombre fixe de tokens.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-sm text-gray-500">
                    Découpe les documents en fonction de leur structure
                  </p>
                </div>
                <Switch
                  checked={ragConfig.useSemanticStructure}
                  onCheckedChange={(checked) =>
                    setRagConfig(prev => ({ ...prev, useSemanticStructure: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="flex items-center">
                    Respect des structures
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Évite de couper au milieu des paragraphes ou sections, 
                            même si cela dépasse légèrement la taille maximale.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-sm text-gray-500">
                    Préserve l'intégrité des paragraphes et sections
                  </p>
                </div>
                <Switch
                  checked={ragConfig.respectStructure}
                  onCheckedChange={(checked) =>
                    setRagConfig(prev => ({ ...prev, respectStructure: checked }))
                  }
                />
              </div>
            </TabsContent>
            
            {/* Onglet Embeddings */}
            <TabsContent value="embeddings" className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center">
                  Modèle d'embedding
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">
                          Sélectionnez un modèle d'embedding spécialisé pour de meilleurs résultats.
                          Différents modèles sont optimisés pour différents usages.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Select
                  value={ragConfig.embeddingModel}
                  onValueChange={(value) => 
                    setRagConfig(prev => ({ ...prev, embeddingModel: value }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un modèle" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALIZED_EMBEDDING_MODELS.map((model: EmbeddingModel) => (
                      <SelectItem key={model.id} value={model.id}>
                        <div className="flex flex-col">
                          <span>{model.name}</span>
                          <span className="text-xs text-gray-500">{model.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Info sur le modèle sélectionné */}
                {ragConfig.embeddingModel && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
                    {(() => {
                      const selectedModel = SPECIALIZED_EMBEDDING_MODELS.find(
                        m => m.id === ragConfig.embeddingModel
                      );
                      
                      if (!selectedModel) return "Modèle non trouvé";
                      
                      return (
                        <div>
                          <p><span className="font-semibold">Dimensions:</span> {selectedModel.dimensions}</p>
                          <p><span className="font-semibold">Fournisseur:</span> {selectedModel.provider}</p>
                          <p><span className="font-semibold">Multilingue:</span> {selectedModel.isMultilingual ? "Oui" : "Non"}</p>
                          <p><span className="font-semibold">Usage recommandé:</span> {selectedModel.recommendedFor.join(", ")}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="flex items-center">
                    Normalisation des vecteurs
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Normalise les vecteurs d'embedding pour améliorer la qualité 
                            des recherches par similarité cosinus.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-sm text-gray-500">
                    Améliore la précision des recherches sémantiques
                  </p>
                </div>
                <Switch
                  checked={ragConfig.normalizeVectors}
                  onCheckedChange={(checked) =>
                    setRagConfig(prev => ({ ...prev, normalizeVectors: checked }))
                  }
                />
              </div>
            </TabsContent>
            
            {/* Onglet Recherche */}
            <TabsContent value="search" className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center">
                    Seuil de similarité ({ragConfig.minSimilarityThreshold})
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Seuil minimum de similarité pour les résultats. 
                            Une valeur plus élevée donne des résultats plus pertinents mais potentiellement moins nombreux.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
                <Slider
                  value={[ragConfig.minSimilarityThreshold]}
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  onValueChange={([value]) => 
                    setRagConfig(prev => ({ ...prev, minSimilarityThreshold: value }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center">
                    Nombre max. de résultats ({ragConfig.maxResults})
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Nombre maximum de chunks à inclure dans le contexte.
                            Plus de résultats = plus de contexte mais potentiellement plus de bruit.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
                <Slider
                  value={[ragConfig.maxResults]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([value]) => 
                    setRagConfig(prev => ({ ...prev, maxResults: value }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="flex items-center">
                    Recherche hybride
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Combine la recherche sémantique (embeddings) avec 
                            une recherche par mots-clés pour de meilleurs résultats.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-sm text-gray-500">
                    Combine recherche vectorielle et mots-clés
                  </p>
                </div>
                <Switch
                  checked={ragConfig.useHybridSearch}
                  onCheckedChange={(checked) =>
                    setRagConfig(prev => ({ ...prev, useHybridSearch: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="flex items-center">
                    Classification des questions
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Analyse le type de question (factuelle, conceptuelle, etc.) 
                            pour adapter la stratégie de recherche.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-sm text-gray-500">
                    Adapte la recherche au type de question
                  </p>
                </div>
                <Switch
                  checked={ragConfig.useQueryClassification}
                  onCheckedChange={(checked) =>
                    setRagConfig(prev => ({ ...prev, useQueryClassification: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="flex items-center">
                    Filtrage par métadonnées
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Utilise les métadonnées des documents (date, type, auteur) 
                            pour améliorer et filtrer les résultats.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-sm text-gray-500">
                    Utilise les métadonnées pour les filtres
                  </p>
                </div>
                <Switch
                  checked={ragConfig.enhanceWithMetadata}
                  onCheckedChange={(checked) =>
                    setRagConfig(prev => ({ ...prev, enhanceWithMetadata: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="flex items-center">
                    Reranking des résultats
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Réorganise les résultats après la recherche initiale
                            en fonction du type de question et des métadonnées.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-sm text-gray-500">
                    Optimise l'ordre des résultats
                  </p>
                </div>
                <Switch
                  checked={ragConfig.reranking}
                  onCheckedChange={(checked) =>
                    setRagConfig(prev => ({ ...prev, reranking: checked }))
                  }
                />
              </div>
            </TabsContent>
            
            {/* Onglet Cache */}
            <TabsContent value="cache" className="space-y-6">
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="flex items-center">
                    Cache local (mémoire)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Stocke les embeddings récemment utilisés en mémoire
                            pour des performances optimales.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-sm text-gray-500">
                    Cache en mémoire pour les accès fréquents
                  </p>
                </div>
                <Switch
                  checked={ragConfig.useLocalCache}
                  onCheckedChange={(checked) =>
                    setRagConfig(prev => ({ ...prev, useLocalCache: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="flex items-center">
                    Cache persistant (BDD)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Stocke les embeddings en base de données
                            pour une réutilisation entre les sessions.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-sm text-gray-500">
                    Persiste les embeddings entre les sessions
                  </p>
                </div>
                <Switch
                  checked={ragConfig.usePersistentCache}
                  onCheckedChange={(checked) =>
                    setRagConfig(prev => ({ ...prev, usePersistentCache: checked }))
                  }
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center">
                    Durée de vie du cache ({ragConfig.cacheTTL / 1440} jours)
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Durée de validité des entrées dans le cache.
                            Les entrées plus anciennes seront recalculées.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                </div>
                <Slider
                  value={[ragConfig.cacheTTL / 1440]} // Convertir minutes en jours
                  min={1}
                  max={30}
                  step={1}
                  onValueChange={([value]) => 
                    setRagConfig(prev => ({ ...prev, cacheTTL: value * 1440 })) // Convertir jours en minutes
                  }
                />
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label className="flex items-center">
                    Compression des vecteurs
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 ml-2" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            Compresse les vecteurs pour économiser de l'espace 
                            avec un impact minimal sur la qualité.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <p className="text-sm text-gray-500">
                    Réduit l'utilisation de mémoire et stockage
                  </p>
                </div>
                <Switch
                  checked={ragConfig.compressionEnabled}
                  onCheckedChange={(checked) =>
                    setRagConfig(prev => ({ ...prev, compressionEnabled: checked }))
                  }
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-8">
            <Button
              onClick={handleSaveConfig}
              disabled={isConfiguring}
              className="w-full h-12 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium"
            >
              {isConfiguring ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/60 border-t-white" />
                  Configuration en cours...
                </div>
              ) : (
                "Sauvegarder la configuration RAG avancée"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
