
import { useState, useEffect } from 'react';
import { useServiceConfiguration } from '@/hooks/useServiceConfiguration';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export interface MicrosoftTeamsConfigProps {
  onSave?: () => void;
}

export const MicrosoftTeamsConfig = ({ onSave }: MicrosoftTeamsConfigProps) => {
  const { config, updateConfig } = useServiceConfiguration('microsoft_teams');
  const [clientId, setClientId] = useState(config?.clientId || '');
  const [tenantId, setTenantId] = useState(config?.tenantId || '');

  useEffect(() => {
    // Log pour debug
    console.log('MicrosoftTeamsConfig mounted', { config });
  }, [config]);

  const handleSave = async () => {
    try {
      if (!clientId || !tenantId) {
        toast({
          title: "Erreur de validation",
          description: "Veuillez remplir tous les champs requis",
          variant: "destructive",
        });
        return;
      }

      console.log('Saving Teams config:', { clientId, tenantId });

      await updateConfig({
        clientId,
        tenantId
      });

      toast({
        title: "Configuration sauvegardée",
        description: "La configuration de Microsoft Teams a été mise à jour avec succès",
      });

      onSave?.();
    } catch (error) {
      console.error('Error saving Teams config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Configuration Microsoft Teams</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="clientId">Client ID</Label>
            <Input
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Entrez votre Client ID"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="tenantId">Tenant ID</Label>
            <Input
              id="tenantId"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="Entrez votre Tenant ID"
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleSave}
            className="w-full"
          >
            Sauvegarder
          </Button>
        </div>
      </Card>
    </div>
  );
};
