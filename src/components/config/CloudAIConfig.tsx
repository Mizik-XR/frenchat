
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ServiceType } from "@/types/config";

interface APIConfig {
  provider: ServiceType;
  apiKey: string;
}

export const CloudAIConfig = () => {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<Record<string, string>>({});

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data: existingConfigs, error } = await supabase
        .from('service_configurations')
        .select('provider_type, config')
        .eq('status', 'configured');

      if (error) throw error;

      const formattedConfigs = existingConfigs.reduce((acc, curr) => {
        if (curr.config?.apiKey) {
          acc[curr.provider_type] = curr.config.apiKey;
        }
        return acc;
      }, {} as Record<string, string>);

      setConfigs(formattedConfigs);
    } catch (error) {
      console.error('Erreur lors du chargement des configurations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les configurations existantes",
        variant: "destructive",
      });
    }
  };

  const handleSaveConfig = async (provider: ServiceType, apiKey: string) => {
    try {
      const { error } = await supabase
        .from('service_configurations')
        .upsert({
          provider_type: provider,
          config: { apiKey },
          status: 'configured',
          last_tested_at: new Date().toISOString()
        }, {
          onConflict: 'provider_type'
        });

      if (error) throw error;

      setConfigs(prev => ({
        ...prev,
        [provider]: apiKey
      }));

      toast({
        title: "Configuration sauvegardée",
        description: `La clé API pour ${provider} a été mise à jour avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/config")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Configuration IA Cloud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OpenAI Configuration */}
          <div className="space-y-4">
            <Label>Configuration OpenAI</Label>
            <div className="flex gap-4">
              <Input
                type="password"
                placeholder="Clé API OpenAI"
                value={configs['openai'] || ''}
                onChange={(e) => setConfigs(prev => ({
                  ...prev,
                  openai: e.target.value
                }))}
              />
              <Button 
                onClick={() => handleSaveConfig('openai', configs['openai'] || '')}
                disabled={!configs['openai']}
              >
                Sauvegarder
              </Button>
            </div>
          </div>

          {/* Perplexity Configuration */}
          <div className="space-y-4">
            <Label>Configuration Perplexity</Label>
            <div className="flex gap-4">
              <Input
                type="password"
                placeholder="Clé API Perplexity"
                value={configs['perplexity'] || ''}
                onChange={(e) => setConfigs(prev => ({
                  ...prev,
                  perplexity: e.target.value
                }))}
              />
              <Button 
                onClick={() => handleSaveConfig('perplexity', configs['perplexity'] || '')}
                disabled={!configs['perplexity']}
              >
                Sauvegarder
              </Button>
            </div>
          </div>

          {/* DeepSeek Configuration */}
          <div className="space-y-4">
            <Label>Configuration DeepSeek</Label>
            <div className="flex gap-4">
              <Input
                type="password"
                placeholder="Clé API DeepSeek"
                value={configs['deepseek'] || ''}
                onChange={(e) => setConfigs(prev => ({
                  ...prev,
                  deepseek: e.target.value
                }))}
              />
              <Button 
                onClick={() => handleSaveConfig('deepseek', configs['deepseek'] || '')}
                disabled={!configs['deepseek']}
              >
                Sauvegarder
              </Button>
            </div>
          </div>

          {/* Anthropic Configuration */}
          <div className="space-y-4">
            <Label>Configuration Anthropic</Label>
            <div className="flex gap-4">
              <Input
                type="password"
                placeholder="Clé API Anthropic"
                value={configs['anthropic'] || ''}
                onChange={(e) => setConfigs(prev => ({
                  ...prev,
                  anthropic: e.target.value
                }))}
              />
              <Button 
                onClick={() => handleSaveConfig('anthropic', configs['anthropic'] || '')}
                disabled={!configs['anthropic']}
              >
                Sauvegarder
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
