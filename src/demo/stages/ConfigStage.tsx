
import React, { useState } from 'react';
import { useDemo } from '../DemoContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Database, FolderOpen, HardDrive, Cloud, FileText, Check } from 'lucide-react';

const DriveOptions = ({ onConfigure }: { onConfigure: () => void }) => {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    // Simuler une connexion à Google Drive
    setTimeout(() => {
      setConnected(true);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Connectez votre compte Google Drive pour indexer vos documents et les rendre interrogeables.
      </p>
      
      {!connected ? (
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center"
          onClick={handleConnect}
          disabled={loading}
        >
          <HardDrive className="h-4 w-4 mr-2" />
          {loading ? "Connexion en cours..." : "Connecter Google Drive"}
        </Button>
      ) : (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center space-x-4">
          <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-green-800 dark:text-green-200">Connecté à Google Drive</h4>
            <p className="text-xs text-green-600 dark:text-green-400">
              Prêt à indexer vos documents
            </p>
          </div>
        </div>
      )}
      
      {connected && (
        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="index-all">Indexer tous les documents</Label>
            <Switch id="index-all" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="index-shared">Inclure les documents partagés</Label>
            <Switch id="index-shared" />
          </div>
          
          <Button onClick={onConfigure} className="w-full mt-4">
            Configurer l'indexation
          </Button>
        </div>
      )}
    </div>
  );
};

const TeamsOptions = ({ onConfigure }: { onConfigure: () => void }) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Connectez votre compte Microsoft Teams pour indexer vos conversations et documents.
      </p>
      
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center"
      >
        <Cloud className="h-4 w-4 mr-2" />
        Connecter Microsoft Teams
      </Button>
      
      <div className="opacity-50">
        <div className="flex items-center justify-between">
          <Label htmlFor="index-channels">Indexer les canaux publics</Label>
          <Switch id="index-channels" disabled />
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <Label htmlFor="index-files">Indexer les fichiers partagés</Label>
          <Switch id="index-files" disabled />
        </div>
      </div>
    </div>
  );
};

const FileUpload = () => {
  const handleFileUpload = () => {
    // Simuler un téléchargement de fichier
    console.log('Fichier téléchargé');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Téléchargez des fichiers directement depuis votre ordinateur pour les indexer.
      </p>
      
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
        <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Glissez-déposez des fichiers ici ou
        </p>
        <Button 
          variant="ghost" 
          className="mt-2"
          onClick={handleFileUpload}
        >
          Parcourir les fichiers
        </Button>
      </div>
    </div>
  );
};

export const ConfigStage = () => {
  const { nextStage } = useDemo();
  const [configurationComplete, setConfigurationComplete] = useState(false);

  const handleConfigure = () => {
    setConfigurationComplete(true);
    
    // Passer à l'étape suivante après un court délai
    setTimeout(() => {
      nextStage();
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold">Configuration des sources de documents</h3>
        <p className="text-muted-foreground">
          Choisissez les sources de documents que vous souhaitez indexer et explorer avec FileChat.
        </p>
      </div>

      {!configurationComplete ? (
        <Card>
          <CardHeader>
            <CardTitle>Sources de documents</CardTitle>
            <CardDescription>
              Connectez vos comptes ou importez des fichiers pour commencer l'indexation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="drive">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="drive">Google Drive</TabsTrigger>
                <TabsTrigger value="teams">Microsoft Teams</TabsTrigger>
                <TabsTrigger value="upload">Upload de fichiers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="drive">
                <DriveOptions onConfigure={handleConfigure} />
              </TabsContent>
              
              <TabsContent value="teams">
                <TeamsOptions onConfigure={handleConfigure} />
              </TabsContent>
              
              <TabsContent value="upload">
                <FileUpload />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full">
              <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200">Configuration terminée</h4>
              <p className="text-green-600 dark:text-green-400 text-sm">
                Vos sources de documents sont configurées
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vous allez maintenant passer à l'étape d'indexation des documents.
          </p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 dark:text-blue-300 flex items-center">
          <Database className="h-4 w-4 mr-2" />
          Options d'intégration complètes
        </h4>
        <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
          La version complète de FileChat prend en charge l'indexation complète des dossiers, 
          des permissions utilisateur, et l'intégration avec d'autres services comme Dropbox, OneDrive, et SharePoint.
        </p>
      </div>
    </div>
  );
};
