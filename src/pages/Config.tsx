
import { ConfigWizard } from "@/components/config/ConfigWizard";
import { ConfigHeader } from "@/components/config/ConfigHeader";
import { isLocalDevelopment } from "@/services/apiConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AIUsageMetrics } from "@/components/config/AIUsageMetrics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function Config() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate("/chat");
  };
  
  return (
    <div className="container py-8 space-y-6 max-w-5xl mx-auto">
      <ConfigHeader onBack={handleBack} />
      
      {!isLocalDevelopment() && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Environnement de production</AlertTitle>
          <AlertDescription>
            L'accès aux fonctionnalités de gestion de la base de données et autres outils 
            d'administration est restreint en production pour des raisons de sécurité.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="usage">Utilisation & Coûts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <ConfigWizard />
        </TabsContent>
        
        <TabsContent value="usage">
          <AIUsageMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
}
