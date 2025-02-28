
import { useState, useEffect } from 'react';
import { useServiceConfiguration } from '@/hooks/useServiceConfiguration';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export interface MicrosoftTeamsConfigProps {
  onSave?: () => void;
}

export const MicrosoftTeamsConfig = ({ onSave }: MicrosoftTeamsConfigProps) => {
  const { config, updateConfig } = useServiceConfiguration('microsoft_teams');
  const [clientId, setClientId] = useState(config?.clientId || '');
  const [tenantId, setTenantId] = useState(config?.tenantId || '');
  const navigate = useNavigate();

  useEffect(() => {
    // Mise à jour de l'état avec les données de configuration lorsqu'elles sont chargées
    if (config) {
      setClientId(config.clientId || '');
      setTenantId(config.tenantId || '');
    }
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

      await updateConfig({
        clientId,
        tenantId
      });

      toast({
        title: "Configuration sauvegardée",
        description: "La configuration de Microsoft Teams a été mise à jour avec succès",
      });

      // Récupérer l'état de la configuration depuis sessionStorage
      const lastConfigState = sessionStorage.getItem('lastConfigState');
      if (lastConfigState) {
        const { step } = JSON.parse(lastConfigState);
        sessionStorage.setItem('currentConfigStep', step.toString());
      }

      // Si une fonction de callback est fournie, l'exécuter
      if (onSave) {
        onSave();
      } else {
        // Sinon, rediriger vers la configuration
        navigate('/config');
      }
    } catch (error) {
      console.error('Error saving Teams config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    }
  };

  const handleBackToConfig = () => {
    // Récupérer l'état de la configuration depuis sessionStorage
    const lastConfigState = sessionStorage.getItem('lastConfigState');
    if (lastConfigState) {
      const { step } = JSON.parse(lastConfigState);
      sessionStorage.setItem('currentConfigStep', step.toString());
    }
    
    navigate('/config');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={handleBackToConfig}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la configuration
          </Button>
          <h2 className="text-xl font-semibold ml-4">Configuration Microsoft Teams</h2>
        </div>

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
          <div className="flex justify-between pt-4">
            <Button 
              variant="outline"
              onClick={handleBackToConfig}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              className="ml-2"
            >
              Sauvegarder
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
