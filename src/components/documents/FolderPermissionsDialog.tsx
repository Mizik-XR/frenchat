
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Users, 
  UserPlus, 
  UserMinus, 
  Share2, 
  Eye, 
  MessageSquare, 
  RefreshCcw 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Folder, 
  FolderPermissions, 
  useGoogleDriveFolders 
} from '@/hooks/useGoogleDriveFolders';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';

interface FolderPermissionsDialogProps {
  folder: Folder;
  trigger?: React.ReactNode;
}

export function FolderPermissionsDialog({ folder, trigger }: FolderPermissionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('permissions');
  const [isUpdating, setIsUpdating] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPermissions, setCurrentPermissions] = useState<FolderPermissions>(
    folder.permissions || { can_read: true, can_query: true, can_reindex: false }
  );
  const [sharedWithList, setSharedWithList] = useState<string[]>(
    folder.shared_with || []
  );
  
  const { 
    updateFolderPermissions, 
    stopSharingFolder,
    updateSharedWith
  } = useGoogleDriveFolders();

  const handlePermissionChange = (key: keyof FolderPermissions) => {
    setCurrentPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePermissions = async () => {
    setIsUpdating(true);
    try {
      await updateFolderPermissions(folder.id, currentPermissions);
      setOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStopSharing = async () => {
    if (confirm("Êtes-vous sûr de vouloir arrêter de partager ce dossier ?")) {
      setIsUpdating(true);
      try {
        await stopSharingFolder(folder.id);
        setOpen(false);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  const handleAddUser = () => {
    if (newEmail && !sharedWithList.includes(newEmail)) {
      setSharedWithList([...sharedWithList, newEmail]);
      setNewEmail('');
    }
  };

  const handleRemoveUser = (email: string) => {
    setSharedWithList(sharedWithList.filter(e => e !== email));
  };

  const handleSaveSharing = async () => {
    setIsUpdating(true);
    try {
      await updateSharedWith(folder.id, sharedWithList);
      setOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Gérer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Gérer le partage du dossier
          </DialogTitle>
          <DialogDescription>
            {folder.name}
            {folder.owner_email && (
              <Badge variant="outline" className="ml-2">
                Propriétaire: {folder.owner_email}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Permissions
            </TabsTrigger>
            <TabsTrigger value="sharing" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Partage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="space-y-4">
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <Label htmlFor="can_read">Lecture</Label>
                </div>
                <Switch 
                  id="can_read"
                  checked={currentPermissions.can_read}
                  onCheckedChange={() => handlePermissionChange('can_read')}
                />
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                Permet d'accéder et de visualiser le contenu du dossier
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <Label htmlFor="can_query">Interrogation</Label>
                </div>
                <Switch 
                  id="can_query"
                  checked={currentPermissions.can_query}
                  onCheckedChange={() => handlePermissionChange('can_query')}
                />
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                Permet d'interroger le contenu dans le chat
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4 text-amber-500" />
                  <Label htmlFor="can_reindex">Réindexation</Label>
                </div>
                <Switch 
                  id="can_reindex"
                  checked={currentPermissions.can_reindex}
                  onCheckedChange={() => handlePermissionChange('can_reindex')}
                />
              </div>
              <div className="text-xs text-muted-foreground ml-6">
                Permet de lancer une réindexation du dossier
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="default" 
                onClick={handleSavePermissions}
                disabled={isUpdating}
              >
                {isUpdating ? "Enregistrement..." : "Enregistrer les permissions"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="new-email">Ajouter un utilisateur</Label>
              <div className="flex gap-2">
                <Input
                  id="new-email"
                  placeholder="exemple@domaine.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <Button 
                  variant="outline" 
                  onClick={handleAddUser}
                  disabled={!newEmail}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label>Partagé avec</Label>
              <ScrollArea className="h-[120px] mt-2 border rounded-lg p-2">
                {sharedWithList.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Ce dossier n'est partagé avec personne
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sharedWithList.map(email => (
                      <div key={email} className="flex items-center justify-between bg-muted/30 p-2 rounded">
                        <span className="text-sm">{email}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => handleRemoveUser(email)}
                        >
                          <UserMinus className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <DialogFooter className="flex justify-between">
              <Button 
                variant="destructive" 
                onClick={handleStopSharing}
                disabled={isUpdating}
              >
                Arrêter de partager
              </Button>
              <Button 
                variant="default" 
                onClick={handleSaveSharing}
                disabled={isUpdating}
              >
                {isUpdating ? "Enregistrement..." : "Enregistrer le partage"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
