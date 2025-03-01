
import { AlertCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BrowserCompatibilityAlertProps {
  issues: string[];
  forceShow?: boolean;
}

export const BrowserCompatibilityAlert = ({ issues, forceShow = false }: BrowserCompatibilityAlertProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldShow, setShouldShow] = useState(false);
  
  useEffect(() => {
    // N'afficher l'alerte que si:
    // 1. On est en mode développement, OU
    // 2. L'URL contient debug=true, OU
    // 3. forceShow est true (pour des cas spécifiques)
    // 4. Les problèmes sont critiques (même en production)
    const isDev = import.meta.env.DEV;
    const hasDebugParam = window.location.search.includes('debug=true');
    const hasCriticalIssues = issues.some(issue => 
      issue.includes("WebAssembly") || 
      issue.includes("Web Workers")
    );
    
    setShouldShow(forceShow || isDev || hasDebugParam || (hasCriticalIssues && issues.length > 0));
  }, [forceShow, issues]);

  if (!isVisible || issues.length === 0 || !shouldShow) return null;

  // Déterminer si le navigateur est trop ancien ou incompatible
  const isOldBrowser = issues.some(issue => issue.includes("WebAssembly") || issue.includes("Web Workers"));

  return (
    <div className="fixed bottom-20 right-4 max-w-sm bg-red-500 text-white rounded-lg shadow-lg z-50 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <h4 className="font-semibold">
              {isOldBrowser 
                ? "Navigateur non compatible" 
                : "Fonctionnalités limitées"}
            </h4>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white hover:text-white/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {isOldBrowser ? (
          <>
            <p className="text-sm">
              Votre navigateur n'est pas compatible avec les fonctionnalités requises par FileChat:
            </p>
            <ul className="text-sm mt-1 list-disc pl-5 mb-3">
              {issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
            <div className="text-sm">
              <p className="font-medium mb-2">Nous vous recommandons d'utiliser:</p>
              <ul className="list-disc pl-5 mb-3">
                <li>Chrome (version 89+)</li>
                <li>Edge (version 89+)</li>
                <li>Firefox (version 90+)</li>
                <li>Safari (version 15+)</li>
              </ul>
              
              <div className="flex gap-2 mt-3">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white text-red-500 hover:bg-white/90 w-full"
                  onClick={() => window.open("https://www.google.com/chrome/", "_blank")}
                >
                  Télécharger Chrome
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white text-red-500 hover:bg-white/90 w-full"
                  onClick={() => setIsVisible(false)}
                >
                  Continuer quand même
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm">
              Votre navigateur ne supporte pas toutes les fonctionnalités recommandées:
            </p>
            <ul className="text-sm mt-1 list-disc pl-5">
              {issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};
