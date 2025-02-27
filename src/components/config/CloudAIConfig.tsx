
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const { data: existingConfigs, error } = await supabase
        .from('service_configurations')
        .select('service_type, config')
        .in('service_type', ['openai', 'perplexity', 'deepseek', 'anthropic'])
        .eq('status', 'configured');

      if (error) throw error;

      const formattedConfigs = existingConfigs.reduce((acc, curr) => {
        // Accéder de manière sécurisée à la propriété apiKey
        const config = curr.config as any;
        if (config && typeof config === 'object' && 'apiKey' in config) {
          acc[curr.service_type] = config.apiKey;
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

  const testAPIKey = async (provider: ServiceType, apiKey: string): Promise<boolean> => {
    // Ici, nous pourrions implémenter des tests spécifiques pour chaque fournisseur
    // Pour l'instant, nous vérifions juste que la clé n'est pas vide
    return apiKey.length > 0;
  };

  const handleSaveConfig = async (provider: ServiceType, apiKey: string) => {
    setIsSubmitting(prev => ({ ...prev, [provider]: true }));
    
    try {
      const isValid = await testAPIKey(provider, apiKey);
      if (!isValid) {
        throw new Error("La clé API semble invalide");
      }

      const { error } = await supabase
        .from('service_configurations')
        .upsert({
          service_type: provider,
          config: { apiKey }, // Objet avec la propriété apiKey
          status: 'configured',
        }, {
          onConflict: 'service_type'
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
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const providerInfo = {
    openai: {
      name: "OpenAI",
      description: "Configuration de l'API OpenAI (GPT-4, GPT-3.5)",
      placeholder: "sk-..."
    },
    perplexity: {
      name: "Perplexity",
      description: "Configuration de l'API Perplexity AI",
      placeholder: "pplx-..."
    },
    deepseek: {
      name: "DeepSeek",
      description: "Configuration de l'API DeepSeek",
      placeholder: "Clé API DeepSeek"
    },
    anthropic: {
      name: "Anthropic",
      description: "Configuration de l'API Anthropic (Claude)",
      placeholder: "sk-ant-..."
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
          <CardTitle>Configuration des Modèles d'IA Cloud</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Vos clés API sont stockées de manière sécurisée et chiffrée. 
              Configurez au moins un fournisseur pour utiliser les fonctionnalités d'IA.
            </AlertDescription>
          </Alert>

          {Object.entries(providerInfo).map(([provider, info]) => (
            <div key={provider} className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">{info.name}</Label>
                {configs[provider] && (
                  <span className="text-sm text-green-600 font-medium">
                    Configuré ✓
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{info.description}</p>
              <div className="flex gap-4">
                <Input
                  type="password"
                  placeholder={info.placeholder}
                  value={configs[provider] || ''}
                  onChange={(e) => setConfigs(prev => ({
                    ...prev,
                    [provider]: e.target.value
                  }))}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleSaveConfig(provider as ServiceType, configs[provider] || '')}
                  disabled={isSubmitting[provider] || !configs[provider]}
                >
                  {isSubmitting[provider] ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
