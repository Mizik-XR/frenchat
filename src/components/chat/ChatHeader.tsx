import { Info, Nut, Plus, Settings, ChevronDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { React, useState } from '@/core/reactInstance';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { AIOptionsPanel } from "@/components/ai/AIOptionsPanel";
import { AIMode } from "@/hooks/useAIMode";
import { AIModeBadge } from "@/components/shared/AIModeBadge";

interface ChatHeaderProps {
  mode: 'auto' | 'manual';
  onModeChange: (mode: 'auto' | 'manual') => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  onResetConversation: () => void;
  setShowUploader?: (show: boolean) => void;
  modelSource: 'cloud' | 'local';
  onModelSourceChange: (source: 'cloud' | 'local') => void;
  currentAIMode: AIMode;
  isLocalAvailable: boolean;
  onAIModeChange: (mode: AIMode) => void;
}

export const ChatHeader = ({
  mode,
  onModeChange,
  showSettings,
  setShowSettings,
  onResetConversation,
  setShowUploader,
  modelSource,
  onModelSourceChange,
  currentAIMode,
  isLocalAvailable,
  onAIModeChange
}: ChatHeaderProps) => {
  const navigate = useNavigate();
  const [showAIOptions, setShowAIOptions] = useState(false);
  
  // Convertir le mode actuel pour la compatibilité
  const handleAIModeChange = (newMode: AIMode) => {
    onAIModeChange(newMode);
    
    // Mettre à jour aussi le mode manuel/auto pour la rétrocompatibilité
    if (newMode === 'hybrid') {
      onModeChange('auto');
    } else {
      onModeChange('manual');
      // Mettre à jour modelSource pour la rétrocompatibilité
      onModelSourceChange(newMode === 'local' ? 'local' : 'cloud');
    }
  };
  
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img 
            src="/filechat-animation.gif" 
            alt="Frenchat Logo" 
            className="h-6 w-6"
          />
          <h2 className="text-lg font-semibold text-gray-900">Frenchat</h2>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <DropdownMenu open={showAIOptions} onOpenChange={setShowAIOptions}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <AIModeBadge mode={currentAIMode} size="sm" showTooltip={false} />
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="p-0">
              <AIOptionsPanel 
                currentMode={currentAIMode}
                isLocalAvailable={isLocalAvailable}
                onModeChange={handleAIModeChange}
                variant="dropdown"
                setShowSettings={setShowSettings}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {setShowUploader && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowUploader(true)}
            className="hover:bg-gray-100"
            title="Ajouter un document"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={onResetConversation}
          className="hover:bg-gray-100"
          title="Réinitialiser la conversation"
        >
          Réinitialiser
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/config")}
          className="hover:bg-gray-100"
          title="Configuration"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

