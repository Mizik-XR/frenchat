
import React from "react";
import { Button } from "@/components/ui/button";
import { useGoogleDrive } from "./useGoogleDrive";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";

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
