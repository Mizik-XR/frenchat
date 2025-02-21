
import { Settings, Bot, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
  mode: 'auto' | 'manual';
  onModeChange: (mode: 'auto' | 'manual') => void;
  onToggleSettings: () => void;
}

export const ChatHeader = ({ mode, onModeChange, onToggleSettings }: ChatHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-blue-100">
      <div className="flex items-center space-x-2">
        <Bot className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Assistant IA</h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={mode === 'auto'}
            onCheckedChange={(checked) => onModeChange(checked ? 'auto' : 'manual')}
          />
          <Label>Mode Auto</Label>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                Le mode Auto sélectionne intelligemment le meilleur modèle selon votre demande :
                <br/>- Images : Utilise OpenAI DALL-E
                <br/>- Documents : Utilise Google Drive/Teams
                <br/>- Texte : Utilise Hugging Face
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onToggleSettings}
          className="h-9 w-9"
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">Paramètres</span>
        </Button>
      </div>
    </div>
  );
};
