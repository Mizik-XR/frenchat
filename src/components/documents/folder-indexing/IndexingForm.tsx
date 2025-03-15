
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Folder, Loader2, Share2, HelpCircle, Database } from 'lucide-react';
import { useGoogleDriveFolders, Folder as DriveFolder } from '@/hooks/useGoogleDriveFolders';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IndexingFormProps {
  onStartIndexing: (folderId: string, options: Record<string, any>) => Promise<void>;
  isLoading: boolean;
  fullDriveMode?: boolean;
}

export function IndexingForm({ onStartIndexing, isLoading, fullDriveMode = false }: IndexingFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { folders, rootFolder, isLoading: isFoldersLoading } = useGoogleDriveFolders();
  
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isRecursive, setIsRecursive] = useState(true);
  const [maxDepth, setMaxDepth] = useState(fullDriveMode ? 50 : 10);
  const [batchSize, setBatchSize] = useState(100);
  const [isShared, setIsShared] = useState(false);
  const [sharingWith, setSharingWith] = useState('');
  const [priorityFileTypes, setPriorityFileTypes] = useState<string[]>(['document', 'spreadsheet', 'presentation']);
  const [throttleRequests, setThrottleRequests] = useState(true);
  const [requestsPerMinute, setRequestsPerMinute] = useState(300);

  const handlePriorityFileTypeToggle = (fileType: string) => {
    setPriorityFileTypes(prev => 
      prev.includes(fileType) 
        ? prev.filter(type => type !== fileType)
        : [...prev, fileType]
    );
  };

  const handleStartIndexing = async () => {
    // Utiliser le dossier root si on est en mode d'indexation complète
    const targetFolderId = fullDriveMode ? (rootFolder?.id || 'root') : selectedFolder;
    
    if (!targetFolderId && !fullDriveMode) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un dossier à indexer",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const options = {
        recursive: isRecursive,
        maxDepth: maxDepth,
        batchSize: batchSize,
        isShared: isShared,
        sharingWith: isShared ? sharingWith.split(',').map(email => email.trim()) : [],
        fullDriveIndexing: fullDriveMode,
        priorityFileTypes: priorityFileTypes,
        throttleRequests: throttleRequests,
        requestsPerMinute: requestsPerMinute
      };

      await onStartIndexing(targetFolderId, options);
      
      // Si le partage est activé, mettre à jour les métadonnées du dossier
      if (isShared && user) {
        const folder = folders.find(f => f.id === targetFolderId);
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
                shared_by: user.id,
                is_full_drive: fullDriveMode
              }
            })
            .eq('folder_id', targetFolderId);
        }
      }
      
      toast({
        title: "Indexation démarrée",
        description: fullDriveMode 
          ? "L'indexation complète de votre Google Drive a démarré. Cela peut prendre du temps."
          : "L'indexation de votre base de connaissances a démarré avec succès",
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
      {!fullDriveMode && (
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
      )}
      
      {fullDriveMode && (
        <Alert className="bg-blue-900/20 border-blue-800">
          <Database className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-100">
            Vous avez choisi d'indexer l'intégralité de votre Google Drive. 
            Cette opération analysera tous les documents auxquels vous avez accès.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4 border rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Switch 
            id="recursive"
            checked={isRecursive}
            onCheckedChange={setIsRecursive}
            disabled={fullDriveMode} // Toujours récursif en mode Drive complet
          />
          <Label htmlFor="recursive">Indexation récursive des sous-dossiers</Label>
        </div>

        {(isRecursive || fullDriveMode) && (
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="maxDepth">Profondeur maximale</Label>
              <Input
                id="maxDepth"
                type="number"
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
                min={1}
                max={100}
              />
              <span className="text-sm text-gray-500">
                Niveau maximum de sous-dossiers à parcourir (augmentez pour une indexation plus complète)
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
        <Label className="font-medium">Types de fichiers prioritaires</Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="documentType" 
              checked={priorityFileTypes.includes('document')}
              onCheckedChange={() => handlePriorityFileTypeToggle('document')}
            />
            <Label htmlFor="documentType">Documents (DOC, DOCX, TXT)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="spreadsheetType" 
              checked={priorityFileTypes.includes('spreadsheet')}
              onCheckedChange={() => handlePriorityFileTypeToggle('spreadsheet')}
            />
            <Label htmlFor="spreadsheetType">Feuilles de calcul</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="presentationType" 
              checked={priorityFileTypes.includes('presentation')}
              onCheckedChange={() => handlePriorityFileTypeToggle('presentation')}
            />
            <Label htmlFor="presentationType">Présentations</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="pdfType" 
              checked={priorityFileTypes.includes('pdf')}
              onCheckedChange={() => handlePriorityFileTypeToggle('pdf')}
            />
            <Label htmlFor="pdfType">PDF</Label>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 border rounded-lg p-4">
        <Label className="font-medium">Paramètres de performance</Label>
        <div className="flex items-center space-x-2 mb-4">
          <Switch 
            id="throttleRequests"
            checked={throttleRequests}
            onCheckedChange={setThrottleRequests}
          />
          <Label htmlFor="throttleRequests">Limiter le nombre de requêtes API</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>Recommandé pour éviter d'atteindre les limites de l'API Google Drive</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {throttleRequests && (
          <div className="space-y-4">
            <Label className="text-sm">Requêtes par minute: {requestsPerMinute}</Label>
            <Slider
              value={[requestsPerMinute]}
              min={100}
              max={1000}
              step={50}
              onValueChange={(value) => setRequestsPerMinute(value[0])}
            />
            <span className="text-xs text-gray-500">
              Plus le nombre est bas, plus l'indexation sera lente mais stable
            </span>
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
        disabled={(!selectedFolder && !fullDriveMode) || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Démarrage de l'indexation...
          </>
        ) : (
          fullDriveMode ? 'Indexer tout mon Google Drive' : 'Indexer ce dossier'
        )}
      </Button>
    </div>
  );
}
