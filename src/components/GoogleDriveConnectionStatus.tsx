
import { useEffect } from 'react';
import { useGoogleDriveStatus } from '@/hooks/useGoogleDriveStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, CloudOff, CloudCog, RefreshCw, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { Badge } from "@/components/ui/badge";

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
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 animate-fadeIn">
      <CardHeader className={`${isConnected ? 'bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20' : 'bg-gray-50 dark:bg-gray-800/50'}`}>
        <CardTitle className="flex items-center gap-2 text-lg">
          {isConnected ? (
            <>
              <CloudCog className="h-5 w-5 text-green-500" />
              <span className="text-green-700 dark:text-green-300">Google Drive connecté</span>
              <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                Actif
              </Badge>
            </>
          ) : (
            <>
              <CloudOff className="h-5 w-5 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">Google Drive non connecté</span>
            </>
          )}
        </CardTitle>
        <CardDescription>
          {isConnected && connectionData?.email 
            ? `Connecté à ${connectionData.email}`
            : "Connectez votre compte Google Drive pour synchroniser vos fichiers"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4 pb-2">
        {isConnected && connectionData ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>Connexion active</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 pl-6">
              Connecté {getTimeAgo(connectionData.connectedSince)}
            </p>
            {connectionData.tokenExpiry && (
              <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                Expiration: {connectionData.tokenExpiry.toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2 py-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aucune connexion active à Google Drive
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              La connexion vous permet de synchroniser vos documents et dossiers Google Drive pour les utiliser dans vos conversations.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-3 pt-2 pb-4">
        {isConnected ? (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={checkGoogleDriveConnection}
              disabled={isChecking}
              className="text-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
              Vérifier
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={disconnectGoogleDrive}
              disabled={isChecking}
              className="text-xs"
            >
              Déconnecter
            </Button>
          </>
        ) : (
          <Button 
            onClick={reconnectGoogleDrive}
            disabled={isChecking}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Connecter à Google Drive
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
