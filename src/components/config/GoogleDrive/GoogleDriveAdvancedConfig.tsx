
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, FolderTree, Settings, Files, RefreshCw, Share2, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

interface FolderItemProps {
  id: string;
  name: string;
  level: number;
  children: number;
  selected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onExpand: (id: string) => void;
  expanded: boolean;
  isLoading: boolean;
}

function FolderItem({ 
  id, 
  name, 
  level, 
  children, 
  selected, 
  onSelect, 
  onExpand, 
  expanded, 
  isLoading 
}: FolderItemProps) {
  return (
    <div className="py-2">
      <div 
        className="flex items-center gap-2" 
        style={{ paddingLeft: `${level * 16}px` }}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 p-0 rounded-full"
          onClick={() => onExpand(id)}
          disabled={children === 0 || isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <div className="h-4 w-4 flex items-center justify-center">
              {children > 0 && (
                expanded ? "-" : "+"
              )}
            </div>
          )}
        </Button>
        
        <FolderTree className="h-4 w-4 text-amber-500 flex-shrink-0" />
        
        <div className="flex items-center justify-between flex-1">
          <span className="text-sm text-gray-200 truncate">{name}</span>
          <Checkbox 
            checked={selected} 
            onCheckedChange={(checked) => onSelect(id, !!checked)} 
            className="ml-2"
          />
        </div>
      </div>
    </div>
  );
}

export function GoogleDriveAdvancedConfig() {
  const [selectedTab, setSelectedTab] = useState("folders");
  const [isConnected, setIsConnected] = useState(true);
  const [indexingInProgress, setIndexingInProgress] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "root": true,
    "folder1": false,
    "folder2": false
  });
  const [selectedFolders, setSelectedFolders] = useState<Record<string, boolean>>({
    "root": false,
    "folder1": true,
    "folder2": false,
    "subfolder1": true
  });
  const [loadingFolders, setLoadingFolders] = useState<Record<string, boolean>>({});
  
  // Paramètres d'indexation
  const [batchSize, setBatchSize] = useState(50);
  const [maxDepth, setMaxDepth] = useState(5);
  const [respectFolderStructure, setRespectFolderStructure] = useState(true);
  const [fileTypes, setFileTypes] = useState(["pdf", "docx", "txt", "pptx", "xlsx"]);
  const [incrementalIndexing, setIncrementalIndexing] = useState(true);
  
  // Paramètres de synchronisation
  const [syncInterval, setSyncInterval] = useState("daily");
  const [syncScope, setSyncScope] = useState("changes");
  
  // Dossiers simulés pour la démonstration
  const folders = [
    { id: "root", name: "Mon Drive", level: 0, children: 2, parent: null },
    { id: "folder1", name: "Documents de travail", level: 1, children: 1, parent: "root" },
    { id: "subfolder1", name: "Rapports 2023", level: 2, children: 0, parent: "folder1" },
    { id: "folder2", name: "Projets personnels", level: 1, children: 0, parent: "root" }
  ];
  
  const handleExpandFolder = (folderId: string) => {
    setLoadingFolders(prev => ({ ...prev, [folderId]: true }));
    
    // Simuler un chargement
    setTimeout(() => {
      setExpandedFolders(prev => ({ 
        ...prev, 
        [folderId]: !prev[folderId] 
      }));
      
      setLoadingFolders(prev => ({ ...prev, [folderId]: false }));
    }, 600);
  };
  
  const handleSelectFolder = (folderId: string, selected: boolean) => {
    setSelectedFolders(prev => ({ ...prev, [folderId]: selected }));
  };
  
  const startIndexing = () => {
    setIndexingInProgress(true);
    setIndexingProgress(0);
    
    // Simuler une progression
    const interval = setInterval(() => {
      setIndexingProgress(prev => {
        const newValue = prev + 5;
        if (newValue >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIndexingInProgress(false);
            toast({
              title: "Indexation terminée",
              description: "Vos documents Google Drive sont maintenant indexés et prêts à être consultés."
            });
          }, 500);
          return 100;
        }
        return newValue;
      });
    }, 500);
  };
  
  return (
    <Card className="border-gray-800 bg-gray-900/60">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Share2 className="h-5 w-5 text-blue-400" />
          Configuration avancée Google Drive
        </CardTitle>
        <CardDescription className="text-gray-400">
          Personnalisez la synchronisation et l'indexation de vos documents Google Drive
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="bg-amber-950/30 border border-amber-900/50 p-4 rounded-lg">
            <p className="text-amber-300 text-sm">
              Vous devez connecter votre compte Google Drive avant de pouvoir configurer l'indexation.
            </p>
            <Button variant="default" className="mt-3">
              Connecter Google Drive
            </Button>
          </div>
        ) : (
          <>
            {indexingInProgress && (
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Indexation en cours...</span>
                  <span className="text-white font-medium">{indexingProgress}%</span>
                </div>
                <Progress value={indexingProgress} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Cette opération peut prendre plusieurs minutes selon le nombre de documents.
                </p>
              </div>
            )}
            
            <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="folders">Dossiers</TabsTrigger>
                <TabsTrigger value="settings">Indexation</TabsTrigger>
                <TabsTrigger value="schedule">Synchronisation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="folders" className="space-y-4">
                <div className="border border-gray-800 rounded-md bg-gray-950/40 h-64 overflow-y-auto p-2">
                  {folders
                    .filter(folder => !folder.parent || expandedFolders[folder.parent])
                    .map(folder => (
                      <FolderItem 
                        key={folder.id}
                        id={folder.id}
                        name={folder.name}
                        level={folder.level}
                        children={folder.children}
                        selected={selectedFolders[folder.id] || false}
                        onSelect={handleSelectFolder}
                        onExpand={handleExpandFolder}
                        expanded={expandedFolders[folder.id] || false}
                        isLoading={loadingFolders[folder.id] || false}
                      />
                    ))
                  }
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <p className="text-gray-400">
                    {Object.values(selectedFolders).filter(Boolean).length} dossiers sélectionnés
                  </p>
                  
                  <Button variant="link" size="sm" className="text-blue-400 p-0 h-auto" onClick={() => {
                    const newSelection = {};
                    folders.forEach(folder => {
                      newSelection[folder.id] = false;
                    });
                    setSelectedFolders(newSelection);
                  }}>
                    Tout désélectionner
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-white">Taille des lots ({batchSize} documents)</Label>
                    <Slider 
                      min={10} 
                      max={200} 
                      step={10} 
                      value={[batchSize]} 
                      onValueChange={(value) => setBatchSize(value[0])}
                    />
                    <p className="text-xs text-gray-500">Nombre de documents traités simultanément. Valeurs élevées = plus rapide mais plus intensif.</p>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-white">Profondeur maximale ({maxDepth} niveaux)</Label>
                    <Slider 
                      min={1} 
                      max={10} 
                      step={1} 
                      value={[maxDepth]} 
                      onValueChange={(value) => setMaxDepth(value[0])}
                    />
                    <p className="text-xs text-gray-500">Nombre de niveaux de sous-dossiers à explorer.</p>
                  </div>
                
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Respecter la structure des dossiers</Label>
                    <Switch 
                      checked={respectFolderStructure} 
                      onCheckedChange={setRespectFolderStructure} 
                    />
                  </div>
                  <p className="text-xs text-gray-500">Les documents conserveront leur hiérarchie de dossiers dans l'interface.</p>
                  
                  <div className="space-y-1">
                    <Label className="text-white">Types de fichiers à indexer</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={fileTypes.join(", ")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les types</SelectItem>
                        <SelectItem value="documents">Documents uniquement</SelectItem>
                        <SelectItem value="spreadsheets">Feuilles de calcul uniquement</SelectItem>
                        <SelectItem value="presentations">Présentations uniquement</SelectItem>
                        <SelectItem value="custom">Personnalisé...</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Indexation incrémentielle</Label>
                    <Switch 
                      checked={incrementalIndexing} 
                      onCheckedChange={setIncrementalIndexing} 
                    />
                  </div>
                  <p className="text-xs text-gray-500">Seuls les documents nouveaux ou modifiés seront indexés lors des mises à jour.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="schedule" className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-white">Intervalle de synchronisation</Label>
                    <Select value={syncInterval} onValueChange={setSyncInterval}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un intervalle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manuel uniquement</SelectItem>
                        <SelectItem value="hourly">Toutes les heures</SelectItem>
                        <SelectItem value="daily">Quotidien</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-white">Étendue de la synchronisation</Label>
                    <Select value={syncScope} onValueChange={setSyncScope}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner l'étendue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="changes">Uniquement les modifications</SelectItem>
                        <SelectItem value="selected">Tous les dossiers sélectionnés</SelectItem>
                        <SelectItem value="all">Tout le Drive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Dernière synchronisation: Aujourd'hui à 14:32</span>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-2 gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Synchroniser maintenant
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
      
      <CardFooter className={indexingInProgress ? "justify-center" : "justify-between"}>
        {indexingInProgress ? (
          <Button variant="outline" onClick={() => setIndexingInProgress(false)}>
            Annuler l'indexation
          </Button>
        ) : (
          <>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Options avancées
            </Button>
            
            <Button 
              onClick={startIndexing}
              disabled={!isConnected || Object.values(selectedFolders).filter(Boolean).length === 0}
            >
              <Files className="h-4 w-4 mr-2" />
              Démarrer l'indexation
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
