
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { APP_STATE } from "@/integrations/supabase/client";

interface StatusIndicatorProps {
  isOnline?: boolean;
  isLoading?: boolean;
  serviceType?: string; // Ajout de cette prop pour résoudre l'erreur
  mode?: "auto" | "manual"; // Ajout de cette prop pour résoudre l'erreur
  model?: string; // Ajout de cette prop pour résoudre l'erreur
  modelSource?: "local" | "cloud"; // Ajout de cette prop pour résoudre l'erreur
}

export function StatusIndicator({ 
  isOnline = true, 
  isLoading = false,
  serviceType,
  mode,
  model,
  modelSource
}: StatusIndicatorProps) {
  const isOfflineMode = APP_STATE.isOfflineMode;
  const statusText = isOfflineMode 
    ? "Mode hors-ligne" 
    : isOnline 
      ? "Connecté" 
      : "Déconnecté";
  
  const statusColor = isOfflineMode 
    ? "bg-amber-500" 
    : isOnline 
      ? "bg-green-500" 
      : "bg-red-500";
  
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Badge variant="outline" className="px-2 py-1 h-fit gap-2 border">
          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
          <span className="text-xs font-normal">{statusText}</span>
        </Badge>
      </Tooltip.Trigger>
      <Tooltip.Content>
        {statusText}
        {model && ` - Modèle: ${model}`}
        {modelSource && ` - Source: ${modelSource}`}
      </Tooltip.Content>
    </Tooltip>
  );
}

export default StatusIndicator;
