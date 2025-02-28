
import { Info, Settings, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
  mode: 'auto' | 'manual';
  onModeChange: (mode: 'auto' | 'manual') => void;
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  onResetConversation: () => void;
  setShowUploader?: (show: boolean) => void;
}

export const ChatHeader = ({ 
  mode, 
  onModeChange,
  showSettings,
  setShowSettings,
  onResetConversation,
  setShowUploader
}: ChatHeaderProps) => {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img 
            src="/filechat-animation.gif" 
            alt="FileChat Logo" 
            className="h-6 w-6"
          />
          <h2 className="text-lg font-semibold text-gray-900">FileChat</h2>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={mode === 'auto'}
            onCheckedChange={(checked) => onModeChange(checked ? 'auto' : 'manual')}
          />
          <Label>Mode Auto</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Le mode Auto sélectionne intelligemment le meilleur modèle selon votre demande
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
          onClick={() => setShowSettings(!showSettings)}
          className="hover:bg-gray-100"
          title="Paramètres"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
