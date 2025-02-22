
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { GoogleDriveButton } from "./GoogleDriveButton";
import { useGoogleDrive } from "./useGoogleDrive";

export const GoogleDriveConfig = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { user } = useAuth();
  const { isConnecting, isConnected, initiateGoogleAuth } = useGoogleDrive(user, () => {
    toast({
      title: "Google Drive connecté",
      description: "La connexion a été établie avec succès.",
    });
  });

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  const handleAdvancedSave = async () => {
    if (!clientId || !clientSecret) {
      toast({
        title: "Erreur",
        description: "Les deux champs sont requis",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('service_configurations')
        .upsert({
          config: { client_id: clientId, client_secret: clientSecret }
        })
        .eq('service_type', 'GOOGLE_OAUTH');

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "Vous pouvez maintenant vous connecter à Google Drive",
      });
      setShowAdvanced(false);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Google Drive</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <div className="text-sm text-green-600">
            Google Drive est connecté et prêt à être utilisé.
          </div>
        ) : (
          <>
            <GoogleDriveButton />

            <div className="text-sm text-muted-foreground">
              Autorisez l'accès à vos documents Google Drive en un clic.
            </div>

            <Dialog open={showAdvanced} onOpenChange={setShowAdvanced}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2">
                  Configuration avancée
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configuration Google Drive</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Votre Client ID"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="Votre Client Secret"
                    />
                  </div>

                  <Button onClick={handleAdvancedSave} className="w-full">
                    Sauvegarder
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    <p>Pour obtenir ces identifiants :</p>
                    <ol className="list-decimal ml-4 mt-2">
                      <li>Accédez à la <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
                      <li>Créez un projet et activez l'API Google Drive</li>
                      <li>Configurez l'écran de consentement OAuth</li>
                      <li>Créez des identifiants OAuth</li>
                    </ol>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}
      </CardContent>
    </Card>
  );
};
