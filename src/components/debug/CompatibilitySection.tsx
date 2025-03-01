
import { CheckCircle, AlertTriangle, Info } from "lucide-react";

interface CompatibilitySectionProps {
  compatibility: {
    compatible: boolean;
    issues: string[];
  };
}

export const CompatibilitySection = ({ compatibility }: CompatibilitySectionProps) => {
  return (
    <div className="p-4 border rounded-lg bg-white dark:bg-gray-800/50">
      <h4 className="font-medium text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
        Compatibilité système
      </h4>
      <div className="flex items-center gap-2 mb-2">
        {compatibility.compatible ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        )}
        <span className="font-medium">
          {compatibility.compatible 
            ? "Système compatible avec l'IA locale" 
            : "Système partiellement compatible"}
        </span>
      </div>
      
      {compatibility.issues.length > 0 && (
        <div className="ml-7 mt-2">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 mb-1">
            <Info className="h-4 w-4" />
            <span className="font-medium text-sm">Limitations détectées:</span>
          </div>
          <ul className="list-disc pl-8 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {compatibility.issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
