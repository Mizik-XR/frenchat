
import React from "react";

interface StatusIndicatorProps {
  mode: "auto" | "manual";
  model: string;
  modelSource: 'cloud' | 'local';
}

export const StatusIndicator = ({ mode, model, modelSource }: StatusIndicatorProps) => {
  return (
    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
      <div>
        <span className="font-medium">Mode:</span>{" "}
        {mode === "auto" ? "Automatique" : "Manuel"}
      </div>
      <div>
        <span className="font-medium">Modèle:</span>{" "}
        {modelSource === "local" ? "Local" : "Cloud"} - {model}
      </div>
    </div>
  );
};
