
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface SummaryStepProps {
  configStatus: {
    googleDrive: boolean;
    teams: boolean;
    llm: boolean;
    image: boolean;
  };
  onFinish: () => void;
}

export const SummaryStep = ({ configStatus, onFinish }: SummaryStepProps) => {
  return (
    <Card className="p-6 animate-fade-in">
      <CardContent className="space-y-6">
        <h2 className="text-2xl font-semibold">Récapitulatif</h2>
        <div className="space-y-4">
          {Object.entries(configStatus).map(([key, isConfigured]) => (
            <Alert key={key} variant={isConfigured ? "default" : "destructive"}>
              {isConfigured ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>
                {key === 'googleDrive' ? 'Google Drive' :
                 key === 'teams' ? 'Microsoft Teams' :
                 key === 'llm' ? 'LLM' : 'Génération d\'images'}
              </AlertTitle>
              <AlertDescription>
                {isConfigured ? "Configuré" : "Non configuré"}
              </AlertDescription>
            </Alert>
          ))}
        </div>

        <Button onClick={onFinish} className="w-full">
          Terminer la configuration
        </Button>
      </CardContent>
    </Card>
  );
};
