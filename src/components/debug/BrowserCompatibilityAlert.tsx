
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface BrowserCompatibilityAlertProps {
  issues: string[];
}

export const BrowserCompatibilityAlert = ({ issues }: BrowserCompatibilityAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || issues.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 max-w-sm bg-red-500 text-white rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <h4 className="font-semibold">Fonctionnalités limitées</h4>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-white/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm">
          Votre navigateur ne supporte pas toutes les fonctionnalités requises pour l'exécution locale:
        </p>
        <ul className="text-sm mt-1 list-disc pl-5">
          {issues.map((issue, index) => (
            <li key={index}>{issue}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
