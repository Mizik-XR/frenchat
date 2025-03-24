
import { useState, useEffect  } from '@/core/reactInstance';
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ZapIcon, InfoIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-3.5 w-3.5 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1 p-1">
                  <p className="font-medium text-sm">Mode Automatique</p>
                  <p className="text-xs">Utilise l'IA locale pour les tâches simples, et bascule vers le cloud pour les tâches complexes. Équilibre optimal entre confidentialité et performances.</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Label>
        <Switch
          checked={isAutoMode}
          onCheckedChange={onAutoModeChange}
        />
      </div>
      <p className="text-xs text-gray-500">
        {isAutoMode 
          ? "L'IA alterne intelligemment entre modèles locaux et IA propriétaire selon la complexité de vos requêtes, optimisant à la fois la confidentialité et les performances" 
          : "Vous utilisez exclusivement le mode que vous avez sélectionné, sans basculement automatique"}
      </p>
    </div>
  );
};
