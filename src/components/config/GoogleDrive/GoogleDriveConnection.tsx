
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";

interface GoogleDriveConnectionProps {
  isConnected: boolean;
  isConnecting: boolean;
  clientId: string | null;
  onConnect: () => void;
  onShowSetup: () => void;
}

export const GoogleDriveConnection = ({
  isConnected,
  isConnecting,
  clientId,
  onConnect,
  onShowSetup,
}: GoogleDriveConnectionProps) => {
  return (
    <>
      {isConnected ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Connexion établie</AlertTitle>
          <AlertDescription>
            Votre compte Google Drive est correctement configuré et prêt à être utilisé.
          </AlertDescription>
        </Alert>
      ) : (
        <Button
          onClick={onConnect}
          className="w-full"
          disabled={isConnecting || !clientId}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          {isConnecting ? 'Connexion en cours...' : 'Se connecter avec Google Drive'}
        </Button>
      )}

      {!clientId && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuration manquante</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>La configuration Google Drive n'est pas complète.</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onShowSetup}
            >
              Configurer maintenant
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground bg-secondary/20 p-4 rounded-md">
        En cliquant sur le bouton ci-dessus, vous serez redirigé vers Google pour autoriser l'accès à vos documents.
        Vous pourrez choisir quels dossiers partager avec l'application.
      </div>
    </>
  );
};
