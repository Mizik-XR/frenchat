
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";

export const GoogleDriveSetup = ({ onConfigured }: { onConfigured: () => void }) => {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!clientId || !clientSecret) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('service_configurations')
        .update({
          config: {
            client_id: clientId,
            client_secret: clientSecret
          }
        })
        .eq('service_type', 'GOOGLE_OAUTH');

      if (error) throw error;

      toast({
        title: "Configuration sauvegardée",
        description: "Les identifiants Google Drive ont été mis à jour avec succès.",
      });
      
      onConfigured();
    } catch (err) {
      console.error("Erreur lors de la sauvegarde:", err);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration Google Drive</CardTitle>
        <CardDescription>
          Pour connecter Google Drive, vous devez fournir les identifiants OAuth obtenus depuis la Google Cloud Console.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">Client ID</Label>
          <Input
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Votre Client ID Google OAuth"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clientSecret">Client Secret</Label>
          <Input
            id="clientSecret"
            value={clientSecret}
            type="password"
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder="Votre Client Secret Google OAuth"
          />
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleSave}
            className="w-full"
            disabled={isSaving}
          >
            {isSaving ? "Sauvegarde en cours..." : "Sauvegarder la configuration"}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground bg-secondary/20 p-4 rounded-md">
          <p>Pour obtenir ces identifiants :</p>
          <ol className="list-decimal ml-4 mt-2 space-y-1">
            <li>Accédez à la <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a></li>
            <li>Créez un nouveau projet ou sélectionnez un projet existant</li>
            <li>Activez l'API Google Drive</li>
            <li>Dans "Identifiants", créez des identifiants OAuth 2.0</li>
            <li>Configurez l'écran de consentement OAuth</li>
            <li>Ajoutez {window.location.origin}/auth/callback/google comme URI de redirection</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
