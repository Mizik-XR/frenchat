
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InfoIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useServiceConfiguration } from "@/hooks/useServiceConfiguration";

export const CloudAIConfig = () => {
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const { config, updateConfig } = useServiceConfiguration("llm");
  const [apiKey, setApiKey] = useState(config?.apiKey || "");

  const handleSave = async () => {
    try {
      await updateConfig({
        provider: selectedProvider,
        apiKey,
      });
      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres de l'IA ont été mis à jour",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'IA Cloud</CardTitle>
          <CardDescription>
            Connectez-vous à différents fournisseurs d'IA pour l'analyse de vos documents.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="openai" onValueChange={setSelectedProvider}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="huggingface">Hugging Face</TabsTrigger>
              <TabsTrigger value="deepseek">DeepSeek</TabsTrigger>
            </TabsList>

            <TabsContent value="openai">
              <div className="space-y-4 mt-4">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    OpenAI offre les modèles les plus performants mais nécessite un compte payant.
                    Coût estimé : ~$0.01 par page de document.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Clé API OpenAI</Label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="huggingface">
              <div className="space-y-4 mt-4">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    Hugging Face propose des modèles open source gratuits.
                    Performances légèrement inférieures mais sans coût.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Token Hugging Face (optionnel)</Label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="hf_..."
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="deepseek">
              <div className="space-y-4 mt-4">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    DeepSeek offre une alternative économique à OpenAI.
                    Coût estimé : ~$0.005 par page de document.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Clé API DeepSeek</Label>
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="dsk-..."
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSave} className="w-full mt-6">
            Sauvegarder la configuration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
