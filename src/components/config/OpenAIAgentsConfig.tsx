
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Info, AlertCircle, Check, Lock } from "lucide-react";
import { useOpenAIAgents } from "@/hooks/ai/useOpenAIAgents";
import { APIKeyField } from "./cloudai/APIKeyField";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const OpenAIAgentsConfig = () => {
  const navigate = useNavigate();
  const { checkAssistantsApiAccess, isLoading } = useOpenAIAgents();
  const [apiKey, setApiKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [enableAgents, setEnableAgents] = useState(false);

  useEffect(() => {
    checkConfigStatus();
  }, []);

  const checkConfigStatus = async () => {
    const hasAccess = await checkAssistantsApiAccess();
    setIsConfigured(hasAccess);
    setEnableAgents(hasAccess);
  };

  const handleSaveConfig = async () => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-service-config', {
        body: { 
          action: 'update', 
          service: 'openai',
          config: { 
            apiKey,
            enableAgents 
          }
        }
      });
      
      if (error) throw error;
      
      setIsConfigured(true);
      toast({
        title: "Configuration mise à jour",
        description: "La configuration des agents OpenAI a été sauvegardée avec succès.",
      });
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde de la configuration:", error);
      toast({
        title: "Erreur de configuration",
        description: error.message || "Une erreur est survenue lors de la sauvegarde de la configuration",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
          <CardTitle className="flex items-center">
            Agents OpenAI (Fonctionnalité Premium)
          </CardTitle>
          <CardDescription>
            Configurez les Agents OpenAI pour des interactions IA plus avancées. Cette fonctionnalité utilise l'API OpenAI Assistants.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Fonctionnalité optionnelle</AlertTitle>
            <AlertDescription>
              Les Agents OpenAI sont une fonctionnalité premium qui nécessite une clé API OpenAI valide.
              Les coûts d'utilisation sont facturés directement par OpenAI.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="config" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="pricing">Tarification</TabsTrigger>
            </TabsList>
            
            <TabsContent value="config" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enable-agents" className="text-base font-medium">Activer les Agents OpenAI</Label>
                  <p className="text-sm text-muted-foreground">
                    Permet d'utiliser les capacités avancées des assistants OpenAI
                  </p>
                </div>
                <Switch 
                  id="enable-agents" 
                  checked={enableAgents} 
                  onCheckedChange={setEnableAgents}
                  disabled={!isConfigured && !apiKey}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label className="text-base font-medium">Clé API OpenAI</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Nécessaire pour accéder aux fonctionnalités des Agents OpenAI
                </p>
                
                <APIKeyField
                  provider="openai"
                  apiKey={apiKey}
                  placeholder="sk-..."
                  isSubmitting={isSubmitting}
                  onApiKeyChange={setApiKey}
                  onSave={handleSaveConfig}
                />
                
                <p className="text-xs text-blue-600 hover:underline mt-2">
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                    Obtenir une clé API OpenAI
                  </a>
                </p>
              </div>

              {isConfigured && (
                <Alert variant="default" className="bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Configuration validée</AlertTitle>
                  <AlertDescription className="text-green-600">
                    Les Agents OpenAI sont correctement configurés et prêts à être utilisés.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-4">
              <Alert variant="default" className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Tarification OpenAI</AlertTitle>
                <AlertDescription className="text-amber-700">
                  L'utilisation des Agents OpenAI est facturée directement par OpenAI selon leurs tarifs.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                <h3 className="text-base font-medium">Coûts approximatifs</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-slate-50">
                    <CardHeader className="py-4">
                      <CardTitle className="text-base">GPT-4o</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Input: $10/million de tokens</p>
                      <p className="text-sm">Output: $30/million de tokens</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-50">
                    <CardHeader className="py-4">
                      <CardTitle className="text-base">GPT-4o-mini</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">Input: $2/million de tokens</p>
                      <p className="text-sm">Output: $6/million de tokens</p>
                    </CardContent>
                  </Card>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  Les tarifs peuvent changer. Consultez la <a href="https://openai.com/pricing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">page de tarification d'OpenAI</a> pour les informations les plus récentes.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
