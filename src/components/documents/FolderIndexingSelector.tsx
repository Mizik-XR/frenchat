
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Folder, Loader2, Share2, Users, BookOpen, RotateCw } from 'lucide-react';
import { useGoogleDriveFolders, Folder as DriveFolder } from '@/hooks/useGoogleDriveFolders';
import { useGoogleDriveStatus } from '@/hooks/useGoogleDriveStatus';
import { useIndexingProgress } from '@/hooks/useIndexingProgress';
import { IndexingProgressBar } from './IndexingProgressBar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface SharedFolder {
  id: string;
  folder_id: string;
  name: string;
  path?: string;
  metadata?: Record<string, any>;
  shared_with?: string[];
  is_shared?: boolean;
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
  const { folders, isLoading: isFoldersLoading, refreshFolders } = useGoogleDriveFolders();
  const { isConnected, checkGoogleDriveConnection } = useGoogleDriveStatus();
  const { indexingProgress, startIndexing } = useIndexingProgress();
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecursive, setIsRecursive] = useState(true);
  const [maxDepth, setMaxDepth] = useState(10);
  const [batchSize, setBatchSize] = useState(100);
  const [activeTab, setActiveTab] = useState('index');
  const [sharedFolders, setSharedFolders] = useState<SharedFolder[]>([]);
  const [isLoadingShared, setIsLoadingShared] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [sharingWith, setSharingWith] = useState('');
  const [recentKnowledgeBases, setRecentKnowledgeBases] = useState<KnowledgeBase[]>([]);
  
  useEffect(() => {
    if (isConnected) {
      loadSharedFolders();
      loadRecentKnowledgeBases();
    }
  }, [isConnected]);

  const loadSharedFolders = async () => {
    if (!user) return;
    setIsLoadingShared(true);
    try {
      const { data, error } = await supabase
        .from('google_drive_folders')
        .select('id, folder_id, name, path, metadata, shared_with')
        .eq('user_id', user.id)
        .eq('is_shared', true);

      if (error) throw error;
      setSharedFolders((data || []).map(folder => ({
        id: folder.id,
        folder_id: folder.folder_id,
        name: folder.name,
        path: folder.path,
        metadata: folder.metadata as Record<string, any>,
        shared_with: folder.shared_with
      })));
    } catch (error) {
      console.error('Error loading shared folders:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les dossiers partagés",
        variant: "destructive",
      });
    } finally {
      setIsLoadingShared(false);
    }
  };

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
      
      // Actualiser la liste des dossiers partagés si nécessaire
      if (isShared) {
        loadSharedFolders();
      }
      
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
    loadSharedFolders();
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
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="gap-2"
        >
          <RotateCw className="h-4 w-4" />
          Actualiser
        </Button>
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
              <TabsTrigger value="shared">
                <Share2 className="h-4 w-4 mr-2" />
                Dossiers partagés
              </TabsTrigger>
              <TabsTrigger value="recent">
                <BookOpen className="h-4 w-4 mr-2" />
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
                        Ces utilisateurs auront accès à la base de connaissances via le chat
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
              {isLoadingShared ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Chargement des dossiers partagés...
                </div>
              ) : sharedFolders.length === 0 ? (
                <div className="text-center py-8 px-4 border rounded-lg">
                  <Share2 className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Aucun dossier partagé</h3>
                  <p className="text-muted-foreground">
                    Partagez un dossier pour le voir apparaître ici
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sharedFolders.map((folder) => (
                    <Card key={folder.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          {folder.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Partagé avec {Array.isArray(folder.shared_with) ? folder.shared_with.length : 0} utilisateur(s)
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFolder(folder.folder_id)}
                          >
                            Réindexer
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Bientôt disponible",
                                description: "La gestion des accès sera disponible prochainement",
                              });
                            }}
                          >
                            Gérer les accès
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
                  <BookOpen className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Aucune base de connaissances récente</h3>
                  <p className="text-muted-foreground">
                    Indexez un dossier pour créer une base de connaissances
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentKnowledgeBases.map((kb) => (
                    <Card key={kb.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-0">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          {kb.current_folder || "Base de connaissances"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4">
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
