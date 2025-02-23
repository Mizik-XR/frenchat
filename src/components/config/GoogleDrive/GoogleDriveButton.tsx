
import { Button } from "@/components/ui/button";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import { Check, Loader2, LogIn } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useGoogleDrive } from "./useGoogleDrive";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const GoogleDriveButton = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isConnected = useGoogleDriveStatus();
  const { isConnecting, initiateGoogleAuth } = useGoogleDrive(user, () => {
    toast({
      title: "Connexion réussie",
      description: "Google Drive a été connecté avec succès",
    });
  });

  const handleNavigateToChat = () => {
    navigate("/chat");
  };

  if (isConnected) {
    return (
      <div className="space-y-4">
        <Button className="w-full" variant="outline" disabled>
          <Check className="mr-2 h-4 w-4 text-green-500" />
          Google Drive connecté
        </Button>
        <p className="text-sm text-muted-foreground">
          Votre compte Google Drive est correctement connecté et prêt à être utilisé.
        </p>
        <Button 
          className="w-full"
          onClick={handleNavigateToChat}
        >
          Aller au Chat
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
      <p className="text-sm text-muted-foreground">
        Autorisez l'accès à Google Drive pour pouvoir indexer et rechercher dans vos documents.
      </p>
    </div>
  );
};

