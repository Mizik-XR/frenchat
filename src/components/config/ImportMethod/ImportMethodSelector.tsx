
import React from "react";
import { Card } from "@/components/ui/card";
import { Cloud, Upload, MessageSquare } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export type ImportMethod = "drive" | "upload" | "teams";

interface ImportMethodSelectorProps {
  onMethodChange: (method: ImportMethod) => void;
  selectedMethod: ImportMethod;
}

export const ImportMethodSelector = ({
  onMethodChange,
  selectedMethod,
}: ImportMethodSelectorProps) => {
  const navigate = useNavigate();

  const handleDriveSelection = () => {
    onMethodChange("drive");
    navigate("/config/google-drive");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Choisissez votre méthode d'import</h3>
      
      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => value === "drive" ? handleDriveSelection() : onMethodChange(value as ImportMethod)}
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
            <RadioGroupItem value="upload" id="upload" className="absolute right-4 top-4" />
            <div className="flex items-start space-x-4">
              <Upload className="h-6 w-6 text-primary" />
              <div>
                <Label htmlFor="upload" className="text-base font-medium">
                  Téléversion One-Shot
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Traitez un dossier en one-shot, idéal pour des opérations ponctuelles
                  sans nécessiter une synchronisation continue.
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
    </div>
  );
};
