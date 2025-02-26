
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FirstTimeSetupProps {
  onActivate: () => void;
  isConfiguring: boolean;
}

export function FirstTimeSetup({ onActivate, isConfiguring }: FirstTimeSetupProps) {
  return (
    <Card className="overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Info className="h-8 w-8 text-blue-500 mt-1 shrink-0" />
          <div className="space-y-4 flex-1">
            <div>
              <h3 className="text-xl font-semibold text-blue-900">Première utilisation ?</h3>
              <p className="text-blue-700 mt-3 leading-relaxed">
                Pour commencer rapidement, nous recommandons d'utiliser notre configuration par défaut 
                basée sur le modèle Mistral via Hugging Face. Ce modèle offre un excellent équilibre 
                entre performances et facilité d'utilisation.
              </p>
            </div>
            <Button
              onClick={onActivate}
              disabled={isConfiguring}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isConfiguring ? "Configuration en cours..." : "Activer la configuration par défaut"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
