
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";

interface FirstTimeSetupProps {
  onActivate: () => Promise<void>;
  isConfiguring: boolean;
}

export function FirstTimeSetup({ onActivate, isConfiguring }: FirstTimeSetupProps) {
  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200 shadow-md overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 bg-purple-100 rounded-full">
            <BrainCircuit className="h-8 w-8 text-purple-700" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-purple-900">Premier démarrage</h3>
            <p className="text-purple-700">
              Pour commencer, vous pouvez activer la configuration par défaut avec le modèle Mistral 7B (recommandé).
            </p>
          </div>
          
          <Button
            onClick={onActivate}
            disabled={isConfiguring}
            className="mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200"
          >
            {isConfiguring ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/60 border-t-white" />
                Activation en cours...
              </div>
            ) : (
              "Activer la configuration par défaut"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
