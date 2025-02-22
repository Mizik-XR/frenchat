
import { useState } from 'react';
import { useServiceConfiguration } from '@/hooks/useServiceConfiguration';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TeamsConfig } from '@/types/config';

export interface MicrosoftTeamsConfigProps {
  onSave?: () => void;
}

export const MicrosoftTeamsConfig = ({ onSave }: MicrosoftTeamsConfigProps) => {
  const { config, updateConfig } = useServiceConfiguration('microsoft_teams');
  const [clientId, setClientId] = useState(config?.clientId || '');
  const [tenantId, setTenantId] = useState(config?.tenantId || '');

  const handleSave = async () => {
    const newConfig: TeamsConfig = {
      clientId,
      tenantId
    };
    
    await updateConfig(newConfig);
    onSave?.();
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-4">Configuration Microsoft Teams</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="clientId">Client ID</Label>
          <Input
            id="clientId"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="Entrez votre Client ID"
          />
        </div>
        <div>
          <Label htmlFor="tenantId">Tenant ID</Label>
          <Input
            id="tenantId"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            placeholder="Entrez votre Tenant ID"
          />
        </div>
        <Button onClick={handleSave}>Sauvegarder</Button>
      </div>
    </Card>
  );
};
