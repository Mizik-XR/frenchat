
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebUIConfig, AIProvider, AnalysisMode } from "@/types/chat";
import { ModelConfigurator } from "./ModelConfigurator";
import { ModelSourceSelector } from "./ModelSourceSelector";
import { AutoModeToggle } from "./AutoModeToggle";

interface SettingsDialogProps {
  webUIConfig: WebUIConfig;
  onWebUIConfigChange: (config: Partial<WebUIConfig>) => void;
  onProviderChange: (provider: AIProvider) => void;
  onAnalysisModeChange: (mode: AnalysisMode) => void;
  modelSource: 'cloud' | 'local';
  onModelSourceChange: (source: 'cloud' | 'local') => void;
  onModeChange: (mode: "auto" | "manual") => void;
  autoMode: boolean;
  setAutoMode: (isAuto: boolean) => void;
}

export function SettingsDialog({
  webUIConfig,
  onWebUIConfigChange,
  onProviderChange,
  onAnalysisModeChange,
  modelSource,
  onModelSourceChange,
  onModeChange,
  autoMode,
  setAutoMode
}: SettingsDialogProps) {
  const handleAutoModeChange = (isEnabled: boolean) => {
    setAutoMode(isEnabled);
    
    // Notify parent
    onModeChange(isEnabled ? "auto" : "manual");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Paramètres</DialogTitle>
          <DialogDescription>Configurez les paramètres de votre interface Frenchat.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="models">Modèles</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <div className="space-y-4">
              <AutoModeToggle 
                isAutoMode={autoMode} 
                onAutoModeChange={handleAutoModeChange} 
              />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="history">Historique des conversations</Label>
                  <p className="text-sm text-muted-foreground">Conserver l'historique des conversations</p>
                </div>
                <Switch 
                  id="history" 
                  checked={webUIConfig.useMemory}
                  onCheckedChange={(checked) => onWebUIConfigChange({ useMemory: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="streaming">Réponses en streaming</Label>
                  <p className="text-sm text-muted-foreground">Afficher les réponses au fur et à mesure</p>
                </div>
                <Switch 
                  id="streaming" 
                  checked={webUIConfig.streamResponse}
                  onCheckedChange={(checked) => onWebUIConfigChange({ streamResponse: checked })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-4 pt-4">
            <div className="space-y-4">
              {!autoMode && (
                <ModelSourceSelector 
                  modelSource={modelSource} 
                  onModelSourceChange={onModelSourceChange} 
                />
              )}

              <ModelConfigurator 
                webUIConfig={webUIConfig}
                onWebUIConfigChange={onWebUIConfigChange}
                onProviderChange={onProviderChange}
                onAnalysisModeChange={onAnalysisModeChange}
                modelSource={modelSource}
                isAutoMode={autoMode}
              />
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Mode sombre</Label>
                  <p className="text-sm text-muted-foreground">Activer le mode sombre</p>
                </div>
                <Switch id="dark-mode" />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact">Mode compact</Label>
                  <p className="text-sm text-muted-foreground">Réduire l'espacement entre les éléments</p>
                </div>
                <Switch id="compact" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="submit">Enregistrer les modifications</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
