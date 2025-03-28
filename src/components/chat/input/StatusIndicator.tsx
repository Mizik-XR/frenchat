
import React, { useEffect, useState } from '@/core/reactInstance';
import { Badge } from "@/components/ui/badge";
import { WifiOff, Wifi, Check, AlertTriangle, X, Server, Cloud, Cpu } from "lucide-react";
import { APP_STATE } from "@/integrations/supabase/client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface StatusIndicatorProps {
  serviceType: string;
  localAIUrl?: string | null;
  mode?: "auto" | "manual";
  model?: string; 
  modelSource?: 'cloud' | 'local';
  localProvider?: string;
}

export const StatusIndicator = ({ 
  serviceType, 
  localAIUrl, 
  mode, 
  model, 
  modelSource,
  localProvider 
}: StatusIndicatorProps) => {
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
              setPingResult("Service temporairement indisponible");
            }
          } catch (error) {
            clearTimeout(timeoutId);
            setIsBackendReachable(false);
            setPingResult("Service temporairement indisponible");
          }
        } else {
          setIsBackendReachable(!APP_STATE.isOfflineMode);
          setPingResult(APP_STATE.isOfflineMode ? "Mode hors ligne actif" : "Service cloud actif");
        }
      } catch (error) {
        setIsBackendReachable(false);
        setPingResult("Service temporairement indisponible");
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

  // Récupérer la couleur selon le provider
  const getProviderColor = () => {
    if (localProvider === 'ollama') return 'bg-green-500 hover:bg-green-600';
    if (localProvider === 'transformers' || localProvider === 'huggingface') return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-green-500 hover:bg-green-600';
  };
  
  // Récupérer l'icône selon le provider
  const getProviderIcon = () => {
    if (localProvider === 'ollama') return <Server className="h-3 w-3" />;
    if (localProvider === 'transformers' || localProvider === 'huggingface') return <Cpu className="h-3 w-3" />;
    return <Server className="h-3 w-3" />;
  };
  
  // Récupérer le label selon le provider
  const getProviderLabel = () => {
    if (localProvider === 'ollama') return 'Ollama';
    if (localProvider === 'transformers') return 'Transformers';
    if (localProvider === 'huggingface') return 'HF';
    return 'Local';
  };

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
          <span>{serviceType === 'local' ? "Passage au cloud" : "Service cloud"}</span>
        </Badge>
      );
    }

    if (modelSource === 'local') {
      return (
        <Badge variant="default" className={`gap-1 ${getProviderColor()}`}>
          {getProviderIcon()}
          <span>{getProviderLabel()}{mode === 'auto' ? ' (Auto)' : ''}</span>
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

  // Infobulles plus détaillées selon le type de service
  const getTooltipContent = () => {
    const baseInfo = (
      <>
        {isOnline ? (
          <p className="flex items-center gap-1 text-green-600">
            <Check className="h-3 w-3" /> Connexion internet active
          </p>
        ) : (
          <p className="flex items-center gap-1 text-red-600">
            <X className="h-3 w-3" /> Pas de connexion internet
          </p>
        )}
      </>
    );

    // Description selon le mode et le provider
    let modeDescription = "";
    if (modelSource === 'local') {
      if (localProvider === 'ollama') {
        modeDescription = "IA locale via Ollama : performances optimales, idéal pour les conversations longues";
      } else if (localProvider === 'transformers' || localProvider === 'huggingface') {
        modeDescription = "IA locale via Python/Transformers : large bibliothèque de modèles, idéal pour l'analyse";
      } else {
        modeDescription = "Confidentialité maximale : vos données restent sur votre ordinateur";
      }
    } else if (modelSource === 'cloud') {
      modeDescription = "Puissance maximale : accès aux modèles les plus performants";
    }
    
    if (mode === 'auto') {
      modeDescription += ", avec basculement automatique selon vos besoins";
    }

    return (
      <div className="space-y-1 text-xs max-w-[220px]">
        {baseInfo}
        <p>{modeDescription}</p>
        {model && <p>Modèle : {model}</p>}
        {!isBackendReachable && (
          <p className="italic">
            Basculement automatique vers le mode le plus adapté
          </p>
        )}
      </div>
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
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
