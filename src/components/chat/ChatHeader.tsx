
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { AIExecutionModeIndicator } from "@/components/config/llm/AIExecutionModeIndicator";
import { Button } from "@/components/ui/button";
import { Settings, Trash, Plus } from "lucide-react";
import { LogoImage } from "@/components/common/LogoImage";

interface ChatHeaderProps {
  onSettingsClick: () => void;
  onNewConversation: () => void;
  onReset: () => void;
}

export function ChatHeader({ onSettingsClick, onNewConversation, onReset }: ChatHeaderProps) {
  const { serviceType } = useHuggingFace();

  return (
    <div className="border-b p-3 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <LogoImage className="h-8 w-8" />
        <h1 className="text-xl font-bold">FileChat</h1>
        <AIExecutionModeIndicator />
      </div>

      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onNewConversation}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Nouvelle conversation</span>
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onReset}
          title="Réinitialiser la conversation"
        >
          <Trash className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onSettingsClick}
          title="Paramètres"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
