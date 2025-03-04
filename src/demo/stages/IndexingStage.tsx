
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { STAGE_DETAILS } from '../constants';
import { useDemo } from '../DemoContext';
import { AlertCircle, CheckCircle, FileText, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface IndexingFile {
  name: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

export const IndexingStage = () => {
  const { currentStage, nextStage } = useDemo();
  const [indexingStarted, setIndexingStarted] = useState(false);
  const [indexingProgress, setIndexingProgress] = useState(0);
  const [filesIndexed, setFilesIndexed] = useState(0);
  const [totalFiles, setTotalFiles] = useState(28);
  const [isCompleted, setIsCompleted] = useState(false);
  const [files, setFiles] = useState<IndexingFile[]>([
    { name: 'Rapport_Q1_2023.pdf', type: 'pdf', status: 'pending' },
    { name: 'Présentation_client.pptx', type: 'pptx', status: 'pending' },
    { name: 'Budget_2023.xlsx', type: 'xlsx', status: 'pending' },
    { name: 'Manuel_utilisateur.docx', type: 'docx', status: 'pending' },
    { name: 'Notes_réunion.txt', type: 'txt', status: 'pending' }
  ]);

  const startIndexing = () => {
    setIndexingStarted(true);
    toast({
      title: "Indexation démarrée",
      description: `${totalFiles} fichiers à traiter`
    });
    
    // Simuler l'indexation progressive
    let currentProgress = 0;
    let filesProcessed = 0;
    
    const interval = setInterval(() => {
      currentProgress += Math.random() * 5;
      filesProcessed = Math.floor((currentProgress / 100) * totalFiles);
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        filesProcessed = totalFiles;
        clearInterval(interval);
        setIsCompleted(true);
        
        toast({
          title: "Indexation terminée",
          description: `${totalFiles} fichiers indexés avec succès`
        });
      }
      
      setIndexingProgress(currentProgress);
      setFilesIndexed(filesProcessed);
      
      // Mettre à jour le statut des fichiers
      setFiles(prev => {
        const newFiles = [...prev];
        for (let i = 0; i < newFiles.length; i++) {
          if (i < filesProcessed % (newFiles.length + 1)) {
            newFiles[i].status = 'completed';
          } else if (i === filesProcessed % (newFiles.length + 1)) {
            newFiles[i].status = 'processing';
          }
        }
        return newFiles;
      });
      
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold mb-4">Indexation des documents</h3>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {STAGE_DETAILS[currentStage]}
        </p>
      </div>

      {!indexingStarted ? (
        <div className="text-center">
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
              L'indexation analysera tous vos documents pour les rendre accessibles via le chat IA.
              Vous pourrez interrompre ce processus à tout moment.
            </AlertDescription>
          </Alert>
          
          <Button size="lg" onClick={startIndexing}>
            Démarrer l'indexation
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression globale</span>
              <span>{Math.round(indexingProgress)}%</span>
            </div>
            <Progress value={indexingProgress} className="h-2" />
            <p className="text-sm text-gray-500 mt-1">
              {filesIndexed} sur {totalFiles} fichiers traités
            </p>
          </div>
          
          <div className="border rounded-md p-4">
            <h4 className="font-medium mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Fichiers en cours de traitement
            </h4>
            
            <div className="space-y-3">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border-b last:border-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>{file.name}</span>
                  </div>
                  <div>
                    {file.status === 'pending' && <span className="text-gray-500 text-sm">En attente</span>}
                    {file.status === 'processing' && <span className="text-blue-500 text-sm">Traitement...</span>}
                    {file.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {file.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {isCompleted && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Indexation terminée avec succès</span>
              </div>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                Tous les documents ont été indexés. Vous pouvez maintenant utiliser le chat pour interroger vos documents.
              </p>
              
              <Button className="mt-4" onClick={nextStage}>
                <Search className="h-4 w-4 mr-2" />
                Essayer le chat
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
