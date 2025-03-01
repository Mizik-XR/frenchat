
import React from "react";
import { useHuggingFace } from "@/hooks/useHuggingFace";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Server, Globe, Cpu, CheckCircle } from "lucide-react";

interface AIExecutionModeIndicatorProps {
  className?: string;
}

export function AIExecutionModeIndicator({ className = "" }: AIExecutionModeIndicatorProps) {
  const { serviceType, hasWebGPU, localAIUrl } = useHuggingFace();
  
  const getIcon = () => {
    switch (serviceType) {
      case 'local':
        return <Server className="h-3 w-3 mr-1" />;
      case 'cloud':
        return <Globe className="h-3 w-3 mr-1" />;
      case 'browser':
        return <Cpu className="h-3 w-3 mr-1" />;
      case 'auto':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      default:
        return <CheckCircle className="h-3 w-3 mr-1" />;
    }
  };
  
  const getLabel = () => {
    switch (serviceType) {
      case 'local':
        return "IA Locale";
      case 'cloud':
        return "IA Cloud";
      case 'browser':
        return "IA Navigateur";
      case 'auto':
        return "IA Auto";
      default:
        return "IA Auto";
    }
  };
  
  const getTooltipContent = () => {
    switch (serviceType) {
      case 'local':
        return `Exécution sur serveur local: ${localAIUrl}`;
      case 'cloud':
        return "Exécution sur nos serveurs cloud";
      case 'browser':
        return "Exécution directement dans votre navigateur";
      case 'auto':
        return "Sélection automatique du meilleur mode d'exécution";
      default:
        return "Sélection automatique du meilleur mode d'exécution";
    }
  };
  
  const getBadgeColor = () => {
    switch (serviceType) {
      case 'local':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'cloud':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'browser':
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case 'auto':
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
      default:
        return "bg-amber-100 text-amber-800 hover:bg-amber-200";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`flex items-center px-2 py-1 ${getBadgeColor()} ${className}`}
          >
            {getIcon()}
            {getLabel()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
