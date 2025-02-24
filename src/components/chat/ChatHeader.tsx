
import { Bot, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface ChatHeaderProps {
  mode: 'auto' | 'manual';
  onModeChange: (mode: 'auto' | 'manual') => void;
}

export const ChatHeader = ({ mode, onModeChange }: ChatHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Files Chat</h2>
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
  );
};
