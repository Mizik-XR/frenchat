
import { ServerIcon, CloudIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type AIModeBadgeProps = {
  mode: 'local' | 'cloud' | 'hybrid';
  provider?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
};

export function AIModeBadge({ 
  mode, 
  provider, 
  size = 'md',
  showTooltip = true 
}: AIModeBadgeProps) {
  // Définir les classes en fonction de la taille
  const sizeClasses = {
    sm: "text-xs py-0 px-1.5",
    md: "text-xs py-1 px-2.5",
    lg: "text-sm py-1.5 px-3",
  };
  
  // Définir les styles en fonction du mode
  const getModeStyle = () => {
    switch (mode) {
      case 'local':
        return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
      case 'cloud':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200";
      case 'hybrid':
        return "bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200";
    }
  };
  
  // Définir l'icône en fonction du mode
  const getModeIcon = () => {
    switch (mode) {
      case 'local':
        return <ServerIcon className="h-3 w-3 mr-1" />;
      case 'cloud':
        return <CloudIcon className="h-3 w-3 mr-1" />;
      case 'hybrid':
        return (
          <div className="relative h-3 w-3 mr-1">
            <ServerIcon className="h-3 w-3 absolute" />
            <CloudIcon className="h-3 w-3 absolute opacity-50" />
          </div>
        );
      default:
        return null;
    }
  };
  
  // Définir le texte du mode
  const getModeText = () => {
    switch (mode) {
      case 'local':
        return provider ? `Local (${provider})` : "Local";
      case 'cloud':
        return provider ? `Cloud (${provider})` : "Cloud";
      case 'hybrid':
        return "Hybride";
      default:
        return "Inconnu";
    }
  };
  
  // Définir le texte de l'info-bulle avec des descriptions plus détaillées
  const getTooltipText = () => {
    switch (mode) {
      case 'local':
        return "Confidentialité totale, fonctionne même hors-ligne. Vos données restent sur votre ordinateur.";
      case 'cloud':
        return "Puissance maximale, idéal pour les tâches complexes et l'analyse approfondie de documents.";
      case 'hybrid':
        return "Utilise l'IA locale pour les tâches simples, bascule vers le cloud pour les tâches complexes. Équilibre optimal entre confidentialité et performances.";
      default:
        return "";
    }
  };
  
  const badge = (
    <Badge 
      variant="outline" 
      className={`${getModeStyle()} ${sizeClasses[size]} font-normal flex items-center border`}
    >
      {getModeIcon()}
      {getModeText()}
    </Badge>
  );
  
  if (!showTooltip) return badge;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
