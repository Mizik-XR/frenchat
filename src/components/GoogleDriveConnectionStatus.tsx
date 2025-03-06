
import { useEffect } from 'react';
import { useGoogleDriveStatus, ConnectionData } from '@/hooks/useGoogleDriveStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CloudOff, CloudSyncIcon, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const GoogleDriveConnectionStatus = () => {
  const { 
    isConnected, 
    isChecking, 
    connectionData, 
    checkGoogleDriveConnection, 
    reconnectGoogleDrive, 
    disconnectGoogleDrive 
  } = useGoogleDriveStatus();

  // Vérifier la connexion au chargement du composant
  useEffect(() => {
    checkGoogleDriveConnection();
  }, [checkGoogleDriveConnection]);

  const getTimeAgo = (date: Date | null): string => {
    if (!date) return '';
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? (
            <>
              <CloudSyncIcon className="h-5 w-5 text-green-500" />
              <span>Google Drive connecté</span>
            </>
          ) : (
            <>
              <CloudOff className="h-5 w-5 text-gray-500" />
              <span>Google Drive non connecté</span>
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isConnected && connectionData?.email 
            ? `Connecté à ${connectionData.email}`
            : "Connectez votre compte Google Drive pour synchroniser vos fichiers"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isConnected && connectionData ? (
          <div className="text-sm">
            <div className="flex items-center gap-1 mb-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>Connexion active</span>
            </div>
            <p className="text-gray-500">
              Connecté {getTimeAgo(connectionData.connectedSince)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Aucune connexion active à Google Drive
          </p>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-3">
        {isConnected ? (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={checkGoogleDriveConnection}
              disabled={isChecking}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
              Vérifier
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={disconnectGoogleDrive}
              disabled={isChecking}
            >
              Déconnecter
            </Button>
          </>
        ) : (
          <Button 
            onClick={reconnectGoogleDrive}
            disabled={isChecking}
          >
            Connecter à Google Drive
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
