
import React, { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { WifiOff, Wifi, Check, AlertTriangle, X, Server, Cloud } from "lucide-react";
import { APP_STATE } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatusIndicatorProps {
  serviceType: string;
  localAIUrl?: string | null;
  mode?: "auto" | "manual";
  model?: string; 
  modelSource?: 'cloud' | 'local';
}

export const StatusIndicator = ({ serviceType, localAIUrl, mode, model, modelSource }: StatusIndicatorProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isBackendReachable, setIsBackendReachable] = useState(!APP_STATE.isOfflineMode);
  const [pingResult, setPingResult] = useState<string | null>(null);

  // Vérifier la connexion réseau
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    // Vérifier la connectivité au backend
    const checkBackendConnectivity = async () => {
      try {
        if (serviceType === 'local' && localAIUrl) {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          
          try {
            const response = await fetch(`${localAIUrl}/health`, {
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
              setIsBackendReachable(true);
              setPingResult("IA locale disponible");
            } else {
              setIsBackendReachable(false);
              setPingResult("Erreur de connexion à l'IA locale");
            }
          } catch (error) {
            clearTimeout(timeoutId);
            setIsBackendReachable(false);
            setPingResult(error instanceof Error ? error.message : "Erreur inconnue");
          }
        } else {
          setIsBackendReachable(!APP_STATE.isOfflineMode);
          setPingResult(APP_STATE.isOfflineMode ? "Mode hors ligne activé" : "Service cloud actif");
        }
      } catch (error) {
        setIsBackendReachable(false);
        setPingResult(error instanceof Error ? error.message : "Erreur inconnue");
      }
    };

    checkBackendConnectivity();
    const interval = setInterval(checkBackendConnectivity, 30000);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      clearInterval(interval);
    };
  }, [serviceType, localAIUrl]);

  // Badge pour le statut réseau
  const getStatusBadge = () => {
    if (!isOnline) {
      return (
        <Badge variant="destructive" className="gap-1">
          <WifiOff className="h-3 w-3" />
          <span>Hors ligne</span>
        </Badge>
      );
    }

    if (APP_STATE.isOfflineMode) {
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700">
          <AlertTriangle className="h-3 w-3" />
          <span>Mode hors ligne</span>
        </Badge>
      );
    }

    if (!isBackendReachable) {
      return (
        <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700">
          <AlertTriangle className="h-3 w-3" />
          <span>{serviceType === 'local' ? "IA locale non disponible" : "Cloud non disponible"}</span>
        </Badge>
      );
    }

    if (modelSource === 'local') {
      return (
        <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
          <Server className="h-3 w-3" />
          <span>IA locale{mode === 'auto' ? ' (Auto)' : ''}</span>
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="gap-1">
        <Cloud className="h-3 w-3" />
        <span>IA Cloud{mode === 'auto' ? ' (Auto)' : ''}</span>
      </Badge>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">
            {getStatusBadge()}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <div className="text-xs">
            <p>Status: {isOnline ? "Connecté" : "Déconnecté"}</p>
            <p>Service: {serviceType === 'local' ? "Local" : "Cloud"}</p>
            {modelSource && <p>Mode: {modelSource === 'local' ? "Local" : "Cloud"}</p>}
            {mode && <p>Mode opération: {mode === 'auto' ? "Automatique" : "Manuel"}</p>}
            {model && <p>Modèle: {model}</p>}
            {pingResult && <p>Diagnostic: {pingResult}</p>}
            {APP_STATE.isOfflineMode && (
              <p className="text-orange-600">Mode hors ligne activé</p>
            )}
            {APP_STATE.lastSupabaseError && (
              <p className="text-red-600 max-w-[200px] truncate">
                Erreur: {APP_STATE.lastSupabaseError.message}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
