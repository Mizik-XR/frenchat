
import { Button } from "@/components/ui/button";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import { Check, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useGoogleDrive } from "./useGoogleDrive";
import { toast } from "@/hooks/use-toast";

export const GoogleDriveButton = () => {
  const { user } = useAuth();
  const isConnected = useGoogleDriveStatus();
  const { isConnecting, initiateGoogleAuth } = useGoogleDrive(user, () => {
    toast({
      title: "Connexion réussie",
      description: "Google Drive a été connecté avec succès",
    });
  });

  if (isConnected) {
    return (
      <>
        <Button className="w-full" variant="outline" disabled>
          <Check className="mr-2 h-4 w-4" />
          Google Drive connecté
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Votre compte Google Drive est correctement connecté et prêt à être utilisé.
        </p>
      </>
    );
  }

  return (
    <>
      <Button 
        onClick={initiateGoogleAuth}
        disabled={isConnecting}
        className="w-full"
      >
        {isConnecting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="mr-2 h-4 w-4" />
        )}
        {isConnecting ? 'Connexion en cours...' : 'Connecter Google Drive'}
      </Button>
      <p className="text-sm text-muted-foreground mt-2">
        Autorisez l'accès à Google Drive pour pouvoir indexer et rechercher dans vos documents.
      </p>
    </>
  );
};
