
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useGoogleDrive } from '@/hooks/useGoogleDrive';
import { GoogleDriveAlert } from './GoogleDriveAlert';
import { useIndexingProgress } from '@/hooks/useIndexingProgress';

export interface GoogleDriveAdvancedConfigProps {
  connected: boolean;
  onIndexingRequest: (recursive: boolean) => void;
}

export function GoogleDriveAdvancedConfig({ connected, onIndexingRequest }: GoogleDriveAdvancedConfigProps) {
  const [recursive, setRecursive] = useState(false);
  const { isConnecting, isConnected, initiateGoogleAuth } = useGoogleDrive();
  const { indexingProgress, isLoading } = useIndexingProgress();
  
  const [error, setError] = useState<string | null>(null);
  const [hasPermissions, setHasPermissions] = useState(false);
  
  const isIndexing = indexingProgress > 0 && indexingProgress < 100;
  
  const handleIndexDrive = () => {
    onIndexingRequest(recursive);
  };
  
  // Function to format the progress status message
  const getProgressStatusMessage = () => {
    if (indexingProgress === 0) {
      return "Prêt à indexer";
    } else if (indexingProgress === 100) {
      return "Indexation terminée";
    } else {
      return `Indexation en cours... ${indexingProgress}%`;
    }
  };
  
  const renderIndexingButton = () => {
    if (isIndexing) {
      return (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Indexation en cours...
        </Button>
      );
    }
    
    if (!connected || !hasPermissions) {
      return (
        <Button disabled className="w-full">
          Indexer
        </Button>
      );
    }
    
    return (
      <Button 
        onClick={handleIndexDrive} 
        variant="default" 
        className="w-full"
      >
        Indexer Drive
      </Button>
    );
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Configuration avancée</CardTitle>
        <CardDescription>
          Paramètres avancés pour l'indexation de Google Drive
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <GoogleDriveAlert 
            type="error" 
            title="Erreur" 
            description={error} 
          />
        )}
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-base font-medium">Indexation récursive</h3>
            <p className="text-sm text-muted-foreground">
              Indexer tous les sous-dossiers du Drive
            </p>
          </div>
          <Switch
            checked={recursive}
            onCheckedChange={setRecursive}
            disabled={!connected || !hasPermissions || isIndexing}
          />
        </div>
        
        {indexingProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{getProgressStatusMessage()}</span>
            </div>
            <Progress value={indexingProgress} className="h-2" />
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        {renderIndexingButton()}
      </CardFooter>
    </Card>
  );
}
