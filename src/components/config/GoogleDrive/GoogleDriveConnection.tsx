
import React from "react";
import { Button } from "@/components/ui/button";
import { useGoogleDrive } from "./useGoogleDrive";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface GoogleDriveConnectionProps {
  onFolderSelect: (folderId: string) => void;
}

export const GoogleDriveConnection = ({ onFolderSelect }: GoogleDriveConnectionProps) => {
  const { user } = useAuth();
  const { isConnecting, isConnected, initiateGoogleAuth } = useGoogleDrive(
    user,
    () => console.log("Configuration sauvegardée")
  );

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className={`w-3 h-3 rounded-full ${
                  isConnected ? 'bg-green-500' : 'bg-red-500'
                } transition-colors`}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{isConnected ? 'Google Drive connecté' : 'Google Drive non connecté'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-sm text-gray-600">
          Statut Google Drive
        </span>
      </div>

      {!isConnected ? (
        <Button 
          onClick={initiateGoogleAuth}
          disabled={isConnecting}
          className="w-full"
        >
          {isConnecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion en cours...
            </>
          ) : (
            "Connecter Google Drive"
          )}
        </Button>
      ) : (
        <Button
          onClick={() => onFolderSelect('root')}
          className="w-full"
        >
          Indexer mon Google Drive
        </Button>
      )}
    </div>
  );
};
