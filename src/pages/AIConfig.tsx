
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { AIConfigProvider } from "@/components/ai-config/AIConfigProvider";
import { ConfigForm } from "@/components/ai-config/ConfigForm";
import { TestSummarySection } from "@/components/ai-config/TestSummarySection";
import { useAIConfigActions } from "@/components/ai-config/useAIConfigActions";

export default function AIConfig() {
  const navigate = useNavigate();
  const { isLoading, loadConfig, saveConfig, testSummary } = useAIConfigActions();

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <AIConfigProvider>
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
            <CardTitle>Configuration du Modèle IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConfigForm 
              isLoading={isLoading}
              onSaveConfig={saveConfig}
            />

            <div className="border-t pt-4 mt-6">
              <CardTitle className="text-lg mb-4">Tester le modèle</CardTitle>
              <TestSummarySection
                isLoading={isLoading}
                onTestSummary={testSummary}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AIConfigProvider>
  );
}
