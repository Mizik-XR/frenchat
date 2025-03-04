import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Folder, 
  Loader2, 
  Share2, 
  Users, 
  BookOpen, 
  RotateCw, 
  Clock, 
  HelpCircle,
  Eye,
  MessageSquare,
  RefreshCcw,
  Settings
} from 'lucide-react';
import { useGoogleDriveFolders, Folder as DriveFolder } from '@/hooks/useGoogleDriveFolders';
import { useGoogleDriveStatus } from '@/hooks/useGoogleDriveStatus';
import { useIndexingProgress } from '@/hooks/useIndexingProgress';
import { IndexingProgressBar } from './IndexingProgressBar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { FolderPermissionsDialog } from './FolderPermissionsDialog';
import { NotificationCenter } from '../notifications/NotificationCenter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface SharedFolder {
  id: string;
  folder_id: string;
  name: string;
  path?: string;
  metadata?: Record<string, any>;
  shared_with?: string[];
  is_shared?: boolean;
  permissions?: {
    can_read: boolean;
    can_query: boolean;
    can_reindex: boolean;
  };
  owner_email?: string;
}

interface KnowledgeBase {
  id: string;
  status: string;
  total_files: number;
  processed_files: number;
  current_folder?: string;
  parent_folder?: string;
}

export function FolderIndexingSelector() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    folders, 
    sharedFolders, 
    isLoading: isFoldersLoading, 
    isSharedLoading,
    refreshFolders 
  } = useGoogleDriveFolders();
  const { isConnected, checkGoogleDriveConnection } = useGoogleDriveStatus();
  const { indexingProgress, startIndexing } = useIndexingProgress();
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecursive, setIsRecursive] = useState(true);
  const [maxDepth, setMaxDepth] = useState(10);
  const [batchSize, setBatchSize] = useState(100);
  const [activeTab, setActiveTab] = useState('index');
  const [isShared, setIsShared] = useState(false);
  const [sharingWith, setSharingWith] = useState('');
  const [recentKnowledgeBases, setRecentKnowledgeBases] = useState<KnowledgeBase[]>([]);
  
  useEffect(() => {
    if (isConnected) {
      loadRecentKnowledgeBases();
    }
  }, [isConnected]);

  const loadRecentKnowledgeBases = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('indexing_progress')
        .select('id, status, total_files, processed_files, current_folder, parent_folder')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentKnowledgeBases(data || []);
    } catch (error) {
      console.error('Error loading recent knowledge bases:', error);
    }
  };
  
  const handleStartIndexing = async () => {
    if (!selectedFolder) return;
    setIsLoading(true);
    try {
      const options = {
        recursive: isRecursive,
        maxDepth: maxDepth,
        batchSize: batchSize,
        isShared: isShared,
        sharingWith: isShared ? sharingWith.split(',').map(email => email.trim()) : []
      };

      await startIndexing(selectedFolder, options);
      
      // Si le partage est activé, mettre à jour les métadonnées du dossier
      if (isShared && user) {
        const folder = folders.find(f => f.id === selectedFolder);
        if (folder) {
          await supabase
            .from('google_drive_folders')
            .update({
              is_shared: true,
              shared_with: sharingWith.split(',').map(email => email.trim()),
              permissions: {
                can_read: true,
                can_query: true,
                can_reindex: false
              },
              metadata: {
                ...folder.metadata,
                shared_at: new Date().toISOString(),
                shared_by: user.id
              }
            })
            .eq('folder_id', selectedFolder);
        }
      }
      
      toast({
        title: "Indexation démarrée",
        description: "L'indexation de votre base de connaissances a démarré avec succès",
      });
      
      // Actualiser la liste des bases de connaissances récentes
      loadRecentKnowledgeBases();
    } catch (error) {
      console.error('Error starting indexation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'indexation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    checkGoogleDriveConnection();
    refreshFolders();
    loadRecentKnowledgeBases();
    toast({
      title: "Actualisation",
      description: "Les données ont été actualisées",
    });
  };

  if (!isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Connexion à Google Drive requise</CardTitle>
          <CardDescription>
            Veuillez vous connecter à Google Drive pour accéder à cette fonctionnalité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/config/google-drive")}>
            Se connecter à Google Drive
          </Button>
        </CardContent>
      </Card>
    );
  }

  const renderBadgeWithoutSize = () => {
    return (
      <Badge variant="outline" className="ml-auto">
        Partagé
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/chat")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au chat
        </Button>
        <div className="flex items-center gap-2">
          <NotificationCenter />
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Base de connaissances Google Drive</CardTitle>
          <CardDescription>
            Indexez vos dossiers Google Drive pour créer une base de connaissances accessible depuis le chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="index">
                <Folder className="h-4 w-4 mr-2" />
                Indexer un dossier
              </TabsTrigger>
              <TabsTrigger value="shared" className="relative">
                <Share2 className="h-4 w-4 mr-2" />
                Dossiers partagés
                {sharedFolders.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="absolute -top-1 -right-1 text-xs h-4 min-w-4 flex items-center justify-center p-0"
                  >
                    {sharedFolders.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="recent">
                <Clock className="h-4 w-4 mr-2" />
                Bases récentes
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="index" className="space-y-6">
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner un dossier à indexer">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      <span>Sélectionner un dossier</span>
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {isFoldersLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Chargement des dossiers...
                    </div>
                  ) : folders.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Aucun dossier trouvé
                    </div>
                  ) : (
                    folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id}>
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          <span>{folder.path || folder.name}</span>
                          {folder.is_shared && (
                            renderBadgeWithoutSize()
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>

              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="recursive"
                    checked={isRecursive}
                    onCheckedChange={setIsRecursive}
                  />
                  <Label htmlFor="recursive">Indexation récursive des sous-dossiers</Label>
                </div>

                {isRecursive && (
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="maxDepth">Profondeur maximale</Label>
                      <Input
                        id="maxDepth"
                        type="number"
                        value={maxDepth}
                        onChange={(e) => setMaxDepth(Number(e.target.value))}
                        min={1}
                        max={50}
                      />
                      <span className="text-sm text-gray-500">
                        Niveau maximum de sous-dossiers à parcourir
                      </span>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="batchSize">Taille des lots</Label>
                      <Input
                        id="batchSize"
                        type="number"
                        value={batchSize}
                        onChange={(e) => setBatchSize(Number(e.target.value))}
                        min={10}
                        max={500}
                      />
                      <span className="text-sm text-gray-500">
                        Nombre de fichiers traités par lot (10-500)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 border rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="shared"
                    checked={isShared}
                    onCheckedChange={setIsShared}
                  />
                  <Label htmlFor="shared" className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Partager cette base de connaissances
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>Le partage permet à d'autres utilisateurs d'accéder à cette base de connaissances depuis leur propre compte.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {isShared && (
                  <div className="space-y-4">
                    <div className="flex flex-col space-y-2">
                      <Label htmlFor="sharingWith">Partager avec (e-mails séparés par des virgules)</Label>
                      <Input
                        id="sharingWith"
                        type="text"
                        value={sharingWith}
                        onChange={(e) => setSharingWith(e.target.value)}
                        placeholder="user@example.com, autre@example.com"
                      />
                      <span className="text-sm text-gray-500">
                        Ces utilisateurs recevront une notification et pourront accéder à vos documents dans le chat
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={handleStartIndexing}
                disabled={!selectedFolder || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Démarrage de l'indexation...
                  </>
                ) : (
                  'Indexer ce dossier'
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="shared" className="space-y-4">
              {isSharedLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Chargement des dossiers partagés...
                </div>
              ) : sharedFolders.length === 0 ? (
                <div className="text-center py-8 px-4 border rounded-lg">
                  <Share2 className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Aucun dossier partagé</h3>
                  <p className="text-muted-foreground">
                    Les dossiers partagés avec vous apparaîtront ici
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sharedFolders.map((folder) => (
                    <Card key={folder.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          {folder.name}
                          <Badge variant="outline" className="ml-auto text-xs">
                            Partagé par {folder.owner_email || "Utilisateur inconnu"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {folder.permissions?.can_read && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <Eye className="h-3 w-3" />
                              Lecture
                            </Badge>
                          )}
                          {folder.permissions?.can_query && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <MessageSquare className="h-3 w-3" />
                              Interrogation
                            </Badge>
                          )}
                          {folder.permissions?.can_reindex && (
                            <Badge variant="secondary" className="gap-1 text-xs">
                              <RefreshCcw className="h-3 w-3" />
                              Réindexation
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-center mt-4">
                          {folder.permissions?.can_reindex && (
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedFolder(folder.id)}
                            >
                              <RefreshCcw className="h-3.5 w-3.5 mr-1" />
                              Réindexer
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="ml-auto"
                          >
                            <FolderPermissionsDialog 
                              folder={folder} 
                              trigger={
                                <div className="flex items-center gap-1">
                                  <Settings className="h-3.5 w-3.5" />
                                  Permissions
                                </div>
                              }
                            />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recent" className="space-y-4">
              {recentKnowledgeBases.length === 0 ? (
                <div className="text-center py-8 px-4 border rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Aucune base de connaissances récente</h3>
                  <p className="text-muted-foreground">
                    Indexez un dossier pour créer une base de connaissances
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentKnowledgeBases.map((kb) => (
                    <Card key={kb.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          {kb.current_folder || "Base de connaissances"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex h-2 w-2 rounded-full ${
                            kb.status === 'completed' ? 'bg-green-500' : 
                            kb.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></span>
                          <span className="text-sm text-muted-foreground">
                            {kb.status === 'completed' ? 'Terminé' : 
                             kb.status === 'error' ? 'Erreur' : 'En cours'}
                          </span>
                          <span className="text-sm text-muted-foreground ml-auto">
                            {kb.processed_files || 0} / {kb.total_files || 0} fichiers
                          </span>
                        </div>
                        {kb.status === 'running' && (
                          <div className="mt-2">
                            <progress 
                              className="w-full h-2" 
                              value={kb.processed_files || 0} 
                              max={kb.total_files || 100}
                            />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {indexingProgress && (
        <IndexingProgressBar progress={indexingProgress} />
      )}
    </div>
  );
}
