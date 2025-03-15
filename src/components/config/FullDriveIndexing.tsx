
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, HardDrive, Server } from 'lucide-react';
import { FolderIndexingSelector } from '@/components/documents/folder-indexing/FolderIndexingSelector';
import { useIndexingProgress } from '@/hooks/useIndexingProgress';
import { Badge } from '@/components/ui/badge';
import { useGoogleDriveFolders } from '@/hooks/useGoogleDriveFolders';

export function FullDriveIndexing() {
  const { startIndexing, indexingProgress, isLoading } = useIndexingProgress();
  const { rootFolder } = useGoogleDriveFolders();

  const handleStartIndexing = async (folderId: string, options: Record<string, any> = {}) => {
    try {
      // On s'assure que fullDriveIndexing est à true pour l'indexation complète
      await startIndexing(folderId, {
        ...options,
        fullDriveIndexing: true
      });
    } catch (error) {
      console.error("Erreur lors de l'indexation complète:", error);
    }
  };
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Database className="h-5 w-5 text-blue-600" />
            Indexation complète de Google Drive
          </CardTitle>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Nouvelle fonctionnalité
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-4 bg-white p-4 rounded-lg border border-blue-100">
            <HardDrive className="h-8 w-8 text-blue-500 mt-1 shrink-0" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Accédez à l'intégralité de vos données</h3>
              <p className="text-sm text-gray-600 mb-2">
                L'indexation complète permet à l'IA d'accéder à l'ensemble de vos documents Google Drive, 
                y compris les sous-dossiers, pour des réponses plus précises et contextuelles.
              </p>
              
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 mt-3">
                <div className="flex items-center gap-1">
                  <Server className="h-3.5 w-3.5 text-blue-400" />
                  <span>Traitement par lots optimisé</span>
                </div>
                <div className="flex items-center gap-1">
                  <Database className="h-3.5 w-3.5 text-blue-400" />
                  <span>Indexation en arrière-plan</span>
                </div>
              </div>
            </div>
          </div>
          
          <FolderIndexingSelector 
            onStartIndexing={handleStartIndexing}
            isLoading={isLoading}
            fullDriveMode={true}
          />
          
          {indexingProgress && indexingProgress.status === 'running' && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-4">
              <p className="text-sm text-blue-800">
                Indexation en cours: {indexingProgress.processed_files || 0} fichiers traités sur {indexingProgress.total_files || '?'}
              </p>
              <div className="w-full bg-blue-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ 
                    width: indexingProgress.total_files 
                      ? `${Math.min(100, (indexingProgress.processed_files / indexingProgress.total_files) * 100)}%` 
                      : '0%' 
                  }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-2">
                L'indexation continuera même si vous fermez cette page.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
