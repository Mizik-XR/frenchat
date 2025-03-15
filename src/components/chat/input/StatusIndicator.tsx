
import { useState } from 'react';
import { 
  AlertCircle, 
  Cpu, 
  CheckCircle, 
  WifiOff, 
  Database,
  Loader2, 
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface StatusIndicatorProps {
  isAIReady?: boolean;
  isOnline?: boolean;
  aiErrors?: string[];
  isBusy?: boolean;
  onClick?: () => void;
  serviceType?: string;
  mode?: "auto" | "manual";
  model?: string;
  modelSource?: "local" | "cloud";
}

export function StatusIndicator({ 
  isAIReady = true, 
  isOnline = true, 
  aiErrors = [], 
  isBusy = false,
  onClick,
  serviceType,
  mode,
  model,
  modelSource
}: StatusIndicatorProps) {
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  // Import APP_STATE dynamically to avoid circular dependencies
  const APP_STATE = {
    isOfflineMode: false,
    hasSupabaseError: false,
    lastSupabaseError: null as Error | null
  };

  // Vérifier l'état combiné du système
  const hasErrors = aiErrors.length > 0 || APP_STATE.hasSupabaseError;
  const isReady = isAIReady && isOnline && !hasErrors;
  const isOffline = APP_STATE.isOfflineMode || !isOnline;

  // Déterminer le statut à afficher
  let status = {
    icon: isBusy ? Loader2 : CheckCircle,
    color: 'text-green-500',
    tooltip: 'Système prêt',
    spinning: isBusy
  };

  if (isOffline) {
    status = {
      icon: WifiOff,
      color: 'text-orange-500',
      tooltip: 'Mode hors ligne',
      spinning: false
    };
  } else if (APP_STATE.hasSupabaseError) {
    status = {
      icon: Database,
      color: 'text-red-500',
      tooltip: 'Erreur de connexion à la base de données',
      spinning: false
    };
  } else if (aiErrors.length > 0) {
    status = {
      icon: AlertCircle,
      color: 'text-red-500',
      tooltip: 'Erreur de l\'IA',
      spinning: false
    };
  } else if (!isAIReady) {
    status = {
      icon: Cpu,
      color: 'text-amber-500',
      tooltip: 'Service IA en cours d\'initialisation',
      spinning: false
    };
  }

  // Afficher les erreurs dans la boîte de dialogue
  const allErrors = [
    ...aiErrors,
    ...(APP_STATE.hasSupabaseError && APP_STATE.lastSupabaseError ? [`Erreur base de données: ${APP_STATE.lastSupabaseError.message}`] : [])
  ];

  // Simple display for chat input status
  if (serviceType && model) {
    return (
      <div className="flex items-center text-xs text-muted-foreground">
        <span className="mr-2">{model} ({modelSource})</span>
        {mode === 'auto' ? (
          <Badge variant="outline" className="text-xs">AUTO</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">MANUEL</Badge>
        )}
      </div>
    );
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className={`${status.color} h-8 w-8 p-0`}
              onClick={() => {
                if (hasErrors) {
                  setShowErrorDialog(true);
                } else if (onClick) {
                  onClick();
                }
              }}
            >
              {status.spinning ? (
                <status.icon className="h-5 w-5 animate-spin" />
              ) : (
                <status.icon className="h-5 w-5" />
              )}
              <span className="sr-only">{status.tooltip}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{status.tooltip}</p>
            {hasErrors && <p className="text-xs">Cliquez pour voir les détails</p>}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Dialogue d'erreur */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Problèmes détectés
            </DialogTitle>
            <DialogDescription>
              Les erreurs suivantes affectent le fonctionnement du système:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {allErrors.map((error, index) => (
              <div key={index} className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {isOffline && (
              <div className="rounded-md bg-amber-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-amber-700">
                      L'application fonctionne en mode hors ligne ou la connexion Internet est limitée.
                      Certaines fonctionnalités peuvent être indisponibles.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex items-center justify-between">
            <Badge variant={isOffline ? "outline" : "secondary"}>
              {isOffline ? "Mode hors ligne" : "Connecté"}
            </Badge>
            <Button onClick={() => setShowErrorDialog(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
