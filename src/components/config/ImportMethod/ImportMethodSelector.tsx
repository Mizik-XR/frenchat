
import React from "react";
import { Card } from "@/components/ui/card";
import { Cloud, MessageSquare } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export type ImportMethod = "drive" | "teams";

interface ImportMethodSelectorProps {
  onMethodChange: (method: ImportMethod) => void;
  selectedMethod: ImportMethod;
}

export const ImportMethodSelector = ({
  onMethodChange,
  selectedMethod,
}: ImportMethodSelectorProps) => {
  const navigate = useNavigate();

  const handleMethodSelection = (method: ImportMethod) => {
    onMethodChange(method);
  };

  const handleNext = () => {
    // Navigation en fonction de la méthode sélectionnée
    if (selectedMethod === "drive") {
      navigate("/config/google-drive");
    } else if (selectedMethod === "teams") {
      navigate("/config/microsoft-teams");
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Choisissez votre méthode d'import</h3>
      
      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => handleMethodSelection(value as ImportMethod)}
        className="grid gap-4"
      >
        <div>
          <Card className="relative p-4 cursor-pointer hover:border-primary transition-colors">
            <RadioGroupItem value="drive" id="drive" className="absolute right-4 top-4" />
            <div className="flex items-start space-x-4">
              <Cloud className="h-6 w-6 text-primary" />
              <div>
                <Label htmlFor="drive" className="text-base font-medium">
                  Synchronisation Google Drive
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Mettez à jour automatiquement vos documents et indexez en continu.
                  Idéal pour garder votre base de connaissances toujours à jour.
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <div>
          <Card className="relative p-4 cursor-pointer hover:border-primary transition-colors">
            <RadioGroupItem value="teams" id="teams" className="absolute right-4 top-4" />
            <div className="flex items-start space-x-4">
              <MessageSquare className="h-6 w-6 text-primary" />
              <div>
                <Label htmlFor="teams" className="text-base font-medium">
                  Microsoft Teams
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Connectez-vous à Microsoft Teams pour indexer vos conversations et documents partagés.
                  Idéal pour les équipes utilisant l'écosystème Microsoft.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </RadioGroup>

      <div className="flex justify-end mt-6">
        <Button onClick={handleNext} className="w-32">
          Suivant
        </Button>
      </div>
    </div>
  );
};
