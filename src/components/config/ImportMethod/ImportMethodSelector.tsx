
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Cloud } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

export type ImportMethod = "drive" | "upload";

interface ImportMethodSelectorProps {
  onMethodChange: (method: ImportMethod) => void;
  selectedMethod: ImportMethod;
}

export const ImportMethodSelector = ({
  onMethodChange,
  selectedMethod,
}: ImportMethodSelectorProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Choisissez votre méthode d'import</h3>
      
      <RadioGroup
        value={selectedMethod}
        onValueChange={(value) => onMethodChange(value as ImportMethod)}
        className="grid gap-4"
      >
        <div>
          <Card className="relative p-4 cursor-pointer hover:border-primary">
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
          <Card className="relative p-4 cursor-pointer hover:border-primary">
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
      </RadioGroup>
    </div>
  );
};
