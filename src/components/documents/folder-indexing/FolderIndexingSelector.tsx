
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, FolderOpen, Database } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider 
} from '@/components/ui/tooltip';
import { IndexingForm } from './IndexingForm';

interface FolderIndexingSelectorProps {
  onStartIndexing: (folderId: string, options: Record<string, any>) => Promise<void>;
  isLoading: boolean;
  fullDriveMode?: boolean;
}

export function FolderIndexingSelector({ 
  onStartIndexing, 
  isLoading,
  fullDriveMode = false
}: FolderIndexingSelectorProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      {!showForm ? (
        <Card className="border-gray-800 bg-gray-900/60 hover:bg-gray-900/80 transition-colors cursor-pointer">
          <CardHeader 
            className="pb-2 flex flex-row items-center justify-between"
            onClick={() => setShowForm(true)}
          >
            <CardTitle className="text-lg flex items-center">
              {fullDriveMode ? (
                <Database className="mr-2 h-5 w-5 text-blue-400" />
              ) : (
                <FolderOpen className="mr-2 h-5 w-5 text-blue-400" />
              )}
              {fullDriveMode ? "Indexer mon Google Drive" : "Sélectionner un dossier à indexer"}
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent className="max-w-md p-4">
                  <p className="text-sm">
                    {fullDriveMode
                      ? "Indexez l'intégralité de votre Google Drive pour permettre à l'IA d'accéder à tous vos documents. Ce processus peut prendre du temps selon le volume de données."
                      : "Sélectionnez un dossier spécifique à indexer pour l'utiliser comme source dans vos conversations avec l'IA."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400">
              {fullDriveMode
                ? "L'indexation complète vous permet d'interroger l'ensemble de vos documents sans restrictions."
                : "L'indexation permet à l'IA d'accéder au contenu de vos fichiers pour répondre à vos questions."}
            </p>
            <Button
              variant="default"
              size="sm"
              className="mt-4"
              onClick={(e) => {
                e.stopPropagation();
                setShowForm(true);
              }}
            >
              {fullDriveMode ? "Configurer l'indexation complète" : "Sélectionner un dossier"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {fullDriveMode ? "Indexation complète du Drive" : "Indexation de dossier"}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Annuler
            </Button>
          </div>
          
          <IndexingForm 
            onStartIndexing={onStartIndexing} 
            isLoading={isLoading} 
            fullDriveMode={fullDriveMode}
          />
        </div>
      )}
    </div>
  );
}
