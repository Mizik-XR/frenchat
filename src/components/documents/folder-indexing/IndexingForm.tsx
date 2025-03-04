
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Folder, Loader2, Share2, HelpCircle } from 'lucide-react';
import { useGoogleDriveFolders, Folder as DriveFolder } from '@/hooks/useGoogleDriveFolders';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface IndexingFormProps {
  onStartIndexing: (folderId: string, options: Record<string, any>) => Promise<void>;
  isLoading: boolean;
}

export function IndexingForm({ onStartIndexing, isLoading }: IndexingFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { folders, isLoading: isFoldersLoading } = useGoogleDriveFolders();
  
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isRecursive, setIsRecursive] = useState(true);
  const [maxDepth, setMaxDepth] = useState(10);
  const [batchSize, setBatchSize] = useState(100);
  const [isShared, setIsShared] = useState(false);
  const [sharingWith, setSharingWith] = useState('');

  const handleStartIndexing = async () => {
    if (!selectedFolder) return;
    
    try {
      const options = {
        recursive: isRecursive,
        maxDepth: maxDepth,
        batchSize: batchSize,
        isShared: isShared,
        sharingWith: isShared ? sharingWith.split(',').map(email => email.trim()) : []
      };

      await onStartIndexing(selectedFolder, options);
      
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
    } catch (error) {
      console.error('Error starting indexation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'indexation",
        variant: "destructive",
      });
    }
  };

  const renderBadgeWithoutSize = () => {
    return (
      <Badge variant="outline" className="ml-auto">
        Partagé
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
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
                  {folder.is_shared && renderBadgeWithoutSize()}
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
    </div>
  );
}
