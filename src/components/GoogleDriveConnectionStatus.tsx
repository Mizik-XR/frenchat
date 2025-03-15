
import { useEffect } from 'react';
import { useGoogleDriveStatus } from '@/hooks/useGoogleDriveStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CloudOff, CloudCog, RefreshCw, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const GoogleDriveConnectionStatus = () => {
  const { 
    isConnected, 
    isChecking, 
    connectionData, 
    error,
    checkGoogleDriveConnection, 
    reconnectGoogleDrive, 
    disconnectGoogleDrive 
  } = useGoogleDriveStatus();

  useEffect(() => {
    checkGoogleDriveConnection();
  }, [checkGoogleDriveConnection]);

  const getTimeAgo = (date: Date | null | undefined): string => {
    if (!date) return '';
    return formatDistanceToNow(date, { addSuffix: true, locale: fr });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? (
            <>
              <CloudCog className="h-5 w-5 text-green-500" />
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
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isConnected && connectionData ? (
          <div className="text-sm">
            <div className="flex items-center gap-1 mb-1">
              <Check className="h-4 w-4 text-green-500" />
              <span>Connexion active</span>
            </div>
            <p className="text-gray-500">
              Connecté {getTimeAgo(connectionData.connectedSince)}
            </p>
            {connectionData.tokenExpiry && (
              <p className="text-gray-500 mt-1">
                Expiration du token: {getTimeAgo(connectionData.tokenExpiry)}
              </p>
            )}
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Status: 
                <span className="ml-1 text-green-500 font-semibold">Actif</span>
              </p>
            </div>
          </div>
        ) : !isChecking ? (
          <div>
            <p className="text-sm text-gray-500">
              Aucune connexion active à Google Drive
            </p>
            <p className="text-sm text-gray-500 mt-2">
              La connexion à Google Drive vous permet d'accéder et d'indexer vos documents pour 
              les utiliser avec FileChat.
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Vérification de la connexion...
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
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              'Connecter à Google Drive'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
