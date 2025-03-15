
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Folder, Loader2, Eye, MessageSquare, RefreshCcw, Settings } from 'lucide-react';
import { useGoogleDriveFolders, Folder as DriveFolder } from '@/hooks/useGoogleDriveFolders';
import { FolderPermissionsDialog } from '../FolderPermissionsDialog';

interface SharedFoldersListProps {
  onSelectFolder: (folderId: string) => void;
}

export function SharedFoldersList({ onSelectFolder }: SharedFoldersListProps) {
  const { sharedFolders, isSharedLoading } = useGoogleDriveFolders();

  if (isSharedLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Chargement des dossiers partagés...
      </div>
    );
  }

  if (sharedFolders.length === 0) {
    return (
      <div className="text-center py-8 px-4 border rounded-lg">
        <Folder className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-medium mb-2">Aucun dossier partagé</h3>
        <p className="text-muted-foreground">
          Les dossiers partagés avec vous apparaîtront ici
        </p>
      </div>
    );
  }

  return (
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
                  onClick={() => onSelectFolder(folder.id)}
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
  );
}
