
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CloudAIConfig } from "@/components/config/CloudAIConfig";
import { LocalAIConfig } from "@/components/config/llm/LocalAIConfig";
import { MicrosoftTeamsConfig } from "@/components/config/MicrosoftTeamsConfig";
import { LLMProviderType } from "@/types/config";

export default function AdvancedConfig() {
  const navigate = useNavigate();
  const [modelPath, setModelPath] = useState("");
  const [provider, setProvider] = useState<LLMProviderType>("huggingface");

  return (
    <div className="container mx-auto py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate("/config")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour à la configuration
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Avancée</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ai" className="space-y-6">
            <TabsList>
              <TabsTrigger value="ai">Configuration IA</TabsTrigger>
              <TabsTrigger value="teams">Microsoft Teams</TabsTrigger>
              <TabsTrigger value="local">IA Locale</TabsTrigger>
            </TabsList>

            <TabsContent value="ai">
              <CloudAIConfig />
            </TabsContent>

            <TabsContent value="teams">
              <MicrosoftTeamsConfig />
            </TabsContent>

            <TabsContent value="local">
              <LocalAIConfig 
                modelPath={modelPath}
                onModelPathChange={setModelPath}
                provider={provider}
                onProviderChange={setProvider}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
