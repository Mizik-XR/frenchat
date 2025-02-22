
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { GoogleConfig } from "@/types/config";

export const GoogleDriveConfig = ({
  config,
  onConfigChange,
  onSave
}: {
  config: GoogleConfig;
  onConfigChange: (config: GoogleConfig) => void;
  onSave: () => void;
}) => {
  const [localConfig, setLocalConfig] = useState<GoogleConfig>(config);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Validation basique
      if (!localConfig.clientId.trim()) {
        toast({
          title: "Erreur",
          description: "L'ID client est requis",
          variant: "destructive",
        });
        return;
      }

      onConfigChange(localConfig);
      onSave();
      
      toast({
        title: "Succès",
        description: "Configuration Google Drive sauvegardée",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration Google Drive</CardTitle>
        <CardDescription>
          Configurez l'accès à Google Drive pour permettre l'intégration avec vos documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clientId">ID Client</Label>
          <Input 
            id="clientId"
            value={localConfig.clientId}
            onChange={(e) => setLocalConfig(prev => ({ ...prev, clientId: e.target.value }))}
            placeholder="Votre ID client Google"
          />
        </div>

        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? "Sauvegarde en cours..." : "Sauvegarder"}
        </Button>
      </CardContent>
    </Card>
  );
};
