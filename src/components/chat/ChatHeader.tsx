
import { Info, Settings, Plus, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ChatHeaderProps {
  mode: 'auto' | 'manual';
  onModeChange: (mode: 'auto' | 'manual') => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  onResetConversation: () => void;
  setShowUploader?: (show: boolean) => void;
  modelSource: 'cloud' | 'local';
  onModelSourceChange: (source: 'cloud' | 'local') => void;
}

export const ChatHeader = ({
  mode,
  onModeChange,
  showSettings,
  setShowSettings,
  onResetConversation,
  setShowUploader,
  modelSource,
  onModelSourceChange
}: ChatHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-between items-center p-2 w-full">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src="/filechat-animation.gif" alt="Frenchat Logo" className="h-7 w-7" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Frenchat</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-full shadow-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Label className="text-xs px-2">IA {modelSource === 'cloud' ? 'propriétaire' : 'locale'}</Label>
                    <Switch 
                      checked={modelSource === 'local'} 
                      onCheckedChange={checked => onModelSourceChange(checked ? 'local' : 'cloud')} 
                      className="data-[state=checked]:bg-green-500"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="max-w-xs text-xs">
                    Mode IA propriétaire: Utilise les modèles Hugging Face en ligne<br />
                    Mode Local: Utilise les modèles installés sur votre machine
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-full shadow-sm">
            <Label className="text-xs px-2">Mode {mode === 'auto' ? 'Auto' : 'Manuel'}</Label>
            <Switch 
              checked={mode === 'auto'} 
              onCheckedChange={checked => onModeChange(checked ? 'auto' : 'manual')} 
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {setShowUploader && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowUploader(true)} 
            className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" 
            title="Ajouter un document"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onResetConversation} 
          className="flex items-center gap-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-xs" 
          title="Réinitialiser la conversation"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Réinitialiser
        </Button>
        
        <Button 
          variant={showSettings ? "default" : "ghost"} 
          size="icon" 
          onClick={() => setShowSettings(!showSettings)} 
          className={`hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full ${showSettings ? 'bg-primary text-white' : ''}`} 
          title="Paramètres"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
