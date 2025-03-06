
import { Info, Nut, Plus, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label>IA propriétaire</Label>
            <Switch
              checked={modelSource === 'local'}
              onCheckedChange={(checked) => onModelSourceChange(checked ? 'local' : 'cloud')}
            />
            <Label>Local</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Mode IA propriétaire: Utilise les modèles Hugging Face en ligne<br />
                    Mode Local: Utilise les modèles installés sur votre machine
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={mode === 'auto'}
              onCheckedChange={(checked) => onModeChange(checked ? 'auto' : 'manual')}
            />
            <Label>Mode Auto</Label>
          </div>
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
