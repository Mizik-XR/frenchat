
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NewConversationButtonProps {
  onClick: () => void;
}

export const NewConversationButton = ({ onClick }: NewConversationButtonProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={onClick} 
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-white transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nouvelle conversation
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Démarrer une nouvelle conversation (Ctrl+N)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
