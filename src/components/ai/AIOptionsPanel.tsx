
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ServerIcon, CloudIcon, Info, Settings, Download } from "lucide-react";
import { AIMode } from "@/hooks/useAIMode";
import { AIModeBadge } from "@/components/shared/AIModeBadge";
import { useSettings } from "@/contexts/SettingsContext";

interface AIOptionsPanelProps {
  currentMode: AIMode;
  isLocalAvailable: boolean;
  onModeChange: (mode: AIMode) => void;
  variant?: "sidebar" | "dropdown" | "inline";
  setShowSettings?: (show: boolean) => void;
}

export const AIOptionsPanel = ({ 
  currentMode, 
  isLocalAvailable, 
  onModeChange, 
  variant = "inline",
  setShowSettings 
}: AIOptionsPanelProps) => {
  const navigate = useNavigate();
  const { isLocalAIAvailable } = useSettings();
  const [showTooltips, setShowTooltips] = useState(true);
  
  // Styles conditionnels selon le variant
  const containerClasses = {
    sidebar: "w-64 h-full border-r",
    dropdown: "w-80",
    inline: "w-full max-w-xl mx-auto"
  };
  
  const goToLocalAISetup = () => {
    navigate("/local-ai-setup");
  };
  
  return (
    <Card className={`p-4 ${containerClasses[variant]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Options d'Intelligence Artificielle</h3>
        {setShowSettings && (
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Mode actuel</span>
          <AIModeBadge mode={currentMode} size="md" showTooltip={showTooltips} />
        </div>
        
        <Tabs 
          defaultValue={currentMode} 
          value={currentMode}
          onValueChange={(v) => onModeChange(v as AIMode)}
          className="w-full bg-background"
        >
          <TabsList className="grid grid-cols-3 w-full bg-muted">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="cloud" className="flex gap-1 items-center" disabled={false}>
                    <CloudIcon className="h-3.5 w-3.5" />
                    Cloud
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-3">
                  <p className="font-medium mb-1">Mode Cloud</p>
                  <p className="text-xs">Modèles IA puissants hébergés sur des serveurs distants. Idéal pour les tâches complexes et l'analyse précise de documents.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger value="hybrid" className="flex gap-1 items-center" disabled={false}>
                    <div className="relative h-3.5 w-3.5">
                      <ServerIcon className="h-3.5 w-3.5 absolute" />
                      <CloudIcon className="h-3.5 w-3.5 absolute opacity-50" />
                    </div>
                    Auto
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-3">
                  <p className="font-medium mb-1">Mode Automatique</p>
                  <p className="text-xs">Basculement intelligent entre local et cloud selon la complexité de vos requêtes. Optimise performances et coûts.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="local" 
                    className="flex gap-1 items-center"
                    disabled={!isLocalAvailable}
                  >
                    <ServerIcon className="h-3.5 w-3.5" />
                    Local
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs p-3">
                  <p className="font-medium mb-1">Mode Local</p>
                  <p className="text-xs">Exécution des modèles sur votre propre machine. Confidentialité maximale, fonctionnement hors-ligne et aucune dépendance aux services cloud.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </TabsList>
        </Tabs>
      </div>
      
      {!isLocalAvailable && isLocalAIAvailable && (
        <div className="mt-6 bg-gray-50 rounded-lg p-3 border">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium mb-1">IA locale non détectée</h4>
              <p className="text-xs text-gray-600 mb-3">
                Installez l'IA locale pour bénéficier de la confidentialité maximale et fonctionner hors-ligne.
              </p>
              <Button 
                size="sm" 
                onClick={goToLocalAISetup}
                className="w-full flex gap-1 items-center justify-center"
              >
                <Download className="h-3.5 w-3.5" />
                Installer l'IA locale
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {isLocalAvailable && (
        <div className="mt-6 bg-green-50 rounded-lg p-3 border border-green-200">
          <div className="flex items-start gap-3">
            <ServerIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium mb-1 text-green-800">IA locale installée</h4>
              <p className="text-xs text-gray-600">
                Votre système est correctement configuré pour l'IA locale.
                <Button 
                  variant="link" 
                  size="sm" 
                  className="h-auto p-0 text-xs text-blue-600"
                  onClick={goToLocalAISetup}
                >
                  Gérer les modèles
                </Button>
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
