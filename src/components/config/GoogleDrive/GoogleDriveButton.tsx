
import { Button } from "@/components/ui/button";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import { Check, Loader2, LogIn } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const GoogleDriveButton = () => {
  const isConnected = useGoogleDriveStatus();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const { data: config, error } = await supabase
        .from('service_configurations')
        .select('config')
        .eq('service_type', 'GOOGLE_OAUTH')
        .single();

      if (error || !config?.config?.client_id) {
        toast({
          title: "Erreur de configuration",
          description: "La configuration Google OAuth n'est pas disponible",
          variant: "destructive",
        });
        return;
      }

      const redirectUri = `${window.location.origin}/auth/callback/google`;
      const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.file');
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.config.client_id}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
      
      window.location.href = authUrl;
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la connexion à Google Drive",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <Button className="w-full" variant="outline" disabled>
        <Check className="mr-2 h-4 w-4" />
        Google Drive connecté
      </Button>
    );
  }

  return (
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
  );
};
