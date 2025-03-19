
import { React } from "@/core/ReactInstance";
import { Badge } from "@/components/ui/badge";
import { Cloud, WifiOff } from "lucide-react";
import useOfflineMode from "@/hooks/useOfflineMode";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

export function ConnectionStatusBadge() {
  const { 
    isOffline, 
    setOfflineMode, 
    isLovableEnvironment, 
    lovablePreferences, 
    setLovablePreferences 
  } = useOfflineMode();

  // Gérer le basculement du mode hors ligne
  const handleOfflineToggle = (enabled: boolean) => {
    setOfflineMode(enabled);
    
    // Si le changement nécessite un rechargement de la page
    if (window.location.pathname.includes('/chat') || 
        window.location.pathname.includes('/document')) {
      toast({
        title: "Rechargement nécessaire",
        description: "La page va être rechargée pour appliquer le changement.",
        variant: "default"
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };
  
  // Gestion du basculement de Supabase dans Lovable
  const handleSupabaseInLovableToggle = (enabled: boolean) => {
    setLovablePreferences(enabled, lovablePreferences.enableLocalAI);
    
    // Notification à l'utilisateur
    toast({
      title: enabled ? 'Mode Supabase activé' : 'Mode Supabase désactivé',
      description: enabled 
        ? 'Rechargement pour activer la connexion Supabase...' 
        : 'Rechargement pour désactiver la connexion Supabase...',
      variant: 'default'
    });
    
    // Rechargement de la page pour appliquer le changement
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };
  
  // Gestion du basculement de l'IA locale dans Lovable
  const handleLocalAIInLovableToggle = (enabled: boolean) => {
    setLovablePreferences(lovablePreferences.enableSupabase, enabled);
    
    // Notification à l'utilisateur
    toast({
      title: enabled ? 'IA locale activée' : 'IA locale désactivée',
      description: enabled 
        ? 'L\'application utilisera l\'IA locale dans l\'environnement Lovable.' 
        : 'L\'application n\'utilisera pas l\'IA locale dans l\'environnement Lovable.',
      variant: 'default'
    });
  };

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 gap-1"
              >
                {isOffline ? (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <Badge variant="offline" className="ml-1">Hors ligne</Badge>
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4 text-blue-500" />
                    <Badge variant="online" className="ml-1">En ligne</Badge>
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Cliquez pour gérer les paramètres de connexion</p>
            </TooltipContent>
          </Tooltip>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Configuration de connexion</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="mr-2 text-sm">Mode hors ligne</span>
              <Switch
                checked={isOffline}
                onCheckedChange={handleOfflineToggle}
              />
            </div>
            
            {isLovableEnvironment && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground pt-2">
                  Options de l'environnement Lovable
                </DropdownMenuLabel>
                
                <div className="flex items-center justify-between my-2">
                  <span className="mr-2 text-sm">Activer Supabase</span>
                  <Switch
                    checked={lovablePreferences.enableSupabase}
                    onCheckedChange={handleSupabaseInLovableToggle}
                  />
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <span className="mr-2 text-sm">Activer IA locale</span>
                  <Switch
                    checked={lovablePreferences.enableLocalAI}
                    onCheckedChange={handleLocalAIInLovableToggle}
                  />
                </div>
              </>
            )}
          </div>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => window.location.href = isOffline 
              ? '/?forceOnline=true' 
              : '/?forceOffline=true'
            }
          >
            Basculer et recharger
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  );
}
