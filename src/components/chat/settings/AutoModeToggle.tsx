
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ZapIcon } from "lucide-react";

interface AutoModeToggleProps {
  isAutoMode: boolean;
  onAutoModeChange: (isEnabled: boolean) => void;
}

export const AutoModeToggle = ({ isAutoMode, onAutoModeChange }: AutoModeToggleProps) => {
  return (
    <div className="space-y-2 border-b pb-4">
      <div className="flex items-center justify-between">
        <Label className="font-medium flex items-center gap-2">
          <ZapIcon className="h-4 w-4 text-yellow-500" />
          Mode automatique
        </Label>
        <Switch
          checked={isAutoMode}
          onCheckedChange={onAutoModeChange}
        />
      </div>
      <p className="text-xs text-gray-500">
        {isAutoMode 
          ? "L'IA alterne automatiquement entre modèles locaux et cloud selon vos requêtes" 
          : "Vous utilisez uniquement le mode que vous avez sélectionné"}
      </p>
    </div>
  );
};
