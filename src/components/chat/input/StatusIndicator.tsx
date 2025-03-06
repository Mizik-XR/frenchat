
import React from "react";
import { Info } from "lucide-react";

interface StatusIndicatorProps {
  mode: "auto" | "manual";
  model: string;
  modelSource: 'cloud' | 'local';
}

export const StatusIndicator = ({ mode, model, modelSource }: StatusIndicatorProps) => {
  return (
    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
      <div className="flex items-center gap-1">
        <span className="font-medium">Mode:</span>{" "}
        <span className={mode === "auto" ? "text-green-600 dark:text-green-400" : ""}>
          {mode === "auto" ? "Automatique" : "Manuel"}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        <span className="font-medium">Modèle:</span>{" "}
        <span className={modelSource === "local" ? "text-blue-600 dark:text-blue-400" : "text-purple-600 dark:text-purple-400"}>
          {modelSource === "local" ? "Local" : "Cloud"}
        </span>
        <span> - {model || "Non spécifié"}</span>
        
        {!model && (
          <Info className="h-3.5 w-3.5 text-amber-500 cursor-help" title="Modèle non spécifié" />
        )}
      </div>
    </div>
  );
};
