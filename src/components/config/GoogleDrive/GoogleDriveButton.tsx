
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import { Check, Loader2, LogIn } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface GoogleDriveButtonProps {
  isConnecting?: boolean;
  onClick?: () => void;
}

export const GoogleDriveButton = ({ isConnecting: externalIsConnecting, onClick }: GoogleDriveButtonProps) => {
  const isConnected = useGoogleDriveStatus();
  const [internalIsConnecting, setInternalIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isConnecting = externalIsConnecting ?? internalIsConnecting;

  const handleConnect = async () => {
    if (onClick) {
      onClick();
      return;
    }

    setError(null);

    try {
      setInternalIsConnecting(true);
      const { data: configData, error } = await supabase
        .from('service_configurations')
        .select('config')
        .eq('service_type', 'GOOGLE_OAUTH')
        .single();

      if (error || !configData?.config || typeof configData.config !== 'object') {
        toast({
          title: "Erreur de configuration",
          description: "La configuration Google OAuth n'est pas disponible",
          variant: "destructive",
        });
        return;
      }

      const config = configData.config as { client_id: string };
      if (!config.client_id) {
        toast({
          title: "Erreur de configuration",
          description: "Client ID manquant dans la configuration",
          variant: "destructive",
        });
        return;
      }

      const redirectUri = `${window.location.origin}/auth/callback/google`;
      const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.client_id}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
      
      window.location.href = authUrl;
    } catch (error) {
      setError("Impossible de démarrer la connexion à Google Drive. Veuillez réessayer.");
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la connexion à Google Drive",
        variant: "destructive",
      });
    } finally {
      setInternalIsConnecting(false);
    }
  };

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
        onClick={handleConnect}
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
      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <p className="text-sm text-muted-foreground mt-2">
        Autorisez l'accès à Google Drive pour pouvoir indexer et rechercher dans vos documents.
      </p>
    </>
  );
};
