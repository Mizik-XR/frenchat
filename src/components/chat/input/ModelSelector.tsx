
import { Sparkles, Search, Brain } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface ModelSelectorProps {
  activeModel: 'mixtral' | 'deepseek' | 'search';
  onModelSelect: (model: 'mixtral' | 'deepseek' | 'search') => void;
}

export function ModelSelector({ activeModel, onModelSelect }: ModelSelectorProps) {
  return (
    <div className="flex gap-2">
      <div className="flex gap-2 p-1 bg-gray-100 rounded-md">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={activeModel === 'mixtral' ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onModelSelect('mixtral')}
                className={`transition-colors ${activeModel === 'mixtral' ? 'bg-blue-100' : ''}`}
              >
                <Sparkles className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline text-xs">Mixtral</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Modèle Mixtral (HuggingFace)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={activeModel === 'deepseek' ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onModelSelect('deepseek')}
                className={`transition-colors ${activeModel === 'deepseek' ? 'bg-purple-100' : ''}`}
              >
                <Brain className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline text-xs">DeepThink</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Analyse avancée avec Hugging Face Deep Search</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={activeModel === 'search' ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onModelSelect('search')}
                className={`transition-colors ${activeModel === 'search' ? 'bg-green-100' : ''}`}
              >
                <Search className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline text-xs">Internet</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Recherche Internet</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
