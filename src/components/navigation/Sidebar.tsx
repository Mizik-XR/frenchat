
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  MessageSquare,
  Settings, 
  Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  to: string;
  isActive?: boolean;
  tooltip?: string;
}

interface SidebarSectionProps {
  title: string;
  items: {
    icon: React.ElementType;
    label: string;
    to: string;
    tooltip?: string;
  }[];
  defaultOpen?: boolean;
  maxVisibleItems?: number;
}

const SidebarItem = ({ icon: Icon, label, to, isActive, tooltip }: SidebarItemProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to={to}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              isActive && "bg-accent text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Button>
        </Link>
      </TooltipTrigger>
      {tooltip && (
        <TooltipContent side="right">
          <p className="max-w-xs">{tooltip}</p>
        </TooltipContent>
      )}
    </Tooltip>
  </TooltipProvider>
);

const SidebarSection = ({ 
  title, 
  items, 
  defaultOpen = true,
  maxVisibleItems = 5 
}: SidebarSectionProps) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  const [showAll, setShowAll] = React.useState(false);
  const location = useLocation();

  const visibleItems = showAll ? items : items.slice(0, maxVisibleItems);
  const hasMore = items.length > maxVisibleItems;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between font-medium"
        >
          {title}
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform",
            isOpen && "transform rotate-90"
          )} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1">
        {visibleItems.map((item, index) => (
          <SidebarItem
            key={index}
            {...item}
            isActive={location.pathname === item.to}
          />
        ))}
        {hasMore && !showAll && (
          <Button
            variant="ghost"
            className="w-full justify-center text-sm text-muted-foreground"
            onClick={() => setShowAll(true)}
          >
            Voir plus
          </Button>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export function Sidebar() {
  const mainItems = [
    {
      icon: MessageSquare,
      label: "Chat",
      to: "/chat",
      tooltip: "Accédez à l'interface de chat pour interagir avec l'assistant et gérer vos documents"
    }
  ];

  const configItems = [
    {
      icon: Cpu,
      label: "IA en local",
      to: "/config/local-ai",
      tooltip: "Configurez et gérez les modèles d'IA en local pour plus de contrôle et de confidentialité"
    },
    {
      icon: Settings,
      label: "Configuration",
      to: "/config",
      tooltip: "Paramètres généraux de l'application et configuration des services"
    }
  ];

  return (
    <div className="w-64 h-screen border-r bg-background/80 backdrop-blur-sm fixed top-0 left-0">
      <div className="flex flex-col h-full p-4 space-y-4">
        <div className="font-semibold text-lg px-4 py-2">
          Lovable
        </div>
        
        <nav className="space-y-2 flex-1 overflow-y-auto">
          <SidebarSection 
            title="Principal" 
            items={mainItems} 
            defaultOpen={true}
          />
          
          <SidebarSection 
            title="Configuration" 
            items={configItems}
            defaultOpen={false} 
          />
        </nav>
      </div>
    </div>
  );
}
