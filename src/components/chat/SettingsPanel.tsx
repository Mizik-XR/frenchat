
import { useState } from "react";
import { AIProvider, WebUIConfig } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface SettingsPanelProps {
  webUIConfig: WebUIConfig;
  onWebUIConfigChange: (config: Partial<WebUIConfig>) => void;
  onProviderChange: (provider: AIProvider) => void;
}

export const SettingsPanel = ({
  webUIConfig,
  onWebUIConfigChange,
  onProviderChange,
}: SettingsPanelProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [googleDriveStatus, setGoogleDriveStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    checkGoogleDriveStatus();
  }, []);

  const checkGoogleDriveStatus = async () => {
    try {
      const { data: tokenData } = await supabase
        .from('oauth_tokens')
        .select('*')
        .eq('provider', 'google')
        .single();

      setGoogleDriveStatus(tokenData ? 'connected' : 'disconnected');
    } catch (error) {
      setGoogleDriveStatus('disconnected');
    }
  };

  const handleLocalModeChange = (enabled: boolean) => {
    if (enabled) {
      onProviderChange('huggingface');
    }
  };

  const getGoogleDriveStatusIcon = () => {
    switch (googleDriveStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
  };

  const navigateToConfig = () => {
    navigate('/config');
  };

  const navigateToChat = () => {
    navigate('/chat');
  };

  return (
    <div className="p-4 bg-white/80 rounded-lg mb-4 border border-gray-200 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={navigateToChat}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au chat
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Configuration du modèle</Label>
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Mode Local</Label>
              <p className="text-sm text-gray-500">Utiliser les modèles en local</p>
            </div>
            <Switch 
              checked={webUIConfig.model === 'huggingface'}
              onCheckedChange={handleLocalModeChange}
            />
          </div>

          <div>
            <Label>Nombre maximum de tokens</Label>
            <Input
              type="number"
              value={webUIConfig.maxTokens}
              onChange={(e) => onWebUIConfigChange({ maxTokens: parseInt(e.target.value) })}
              min={1}
              max={4096}
            />
          </div>

          <div>
            <Label>Température</Label>
            <Input
              type="number"
              value={webUIConfig.temperature}
              onChange={(e) => onWebUIConfigChange({ temperature: parseFloat(e.target.value) })}
              min={0}
              max={2}
              step={0.1}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Streaming</Label>
              <p className="text-sm text-gray-500">Afficher la réponse en temps réel</p>
            </div>
            <Switch
              checked={webUIConfig.streamResponse}
              onCheckedChange={(checked) => onWebUIConfigChange({ streamResponse: checked })}
            />
          </div>

          <div className="flex items-center justify-between border p-4 rounded-lg bg-gray-50">
            <div>
              <Label className="font-medium">Google Drive</Label>
              <p className="text-sm text-gray-500">État de la connexion</p>
            </div>
            <div className="flex items-center gap-3">
              {getGoogleDriveStatusIcon()}
              <Button 
                variant="outline"
                onClick={navigateToConfig}
                size="sm"
              >
                Configurer
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? "Masquer les options avancées" : "Afficher les options avancées"}
      </Button>
    </div>
  );
};
