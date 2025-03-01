
import { AlertCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BrowserCompatibilityAlertProps {
  issues: string[];
  forceShow?: boolean;
  clientMode?: boolean; // Mode client (simplifié)
  developerMode?: boolean; // Nouveau: Mode développeur (détaillé)
}

export const BrowserCompatibilityAlert = ({ 
  issues = [], // Valeur par défaut pour éviter les erreurs
  forceShow = false,
  clientMode = true,
  developerMode = false
}: BrowserCompatibilityAlertProps) => {
  // Protection contre les erreurs catastrophiques
  try {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldShow, setShouldShow] = useState(false);
    
    useEffect(() => {
      try {
        // N'afficher l'alerte que si:
        // 1. Les problèmes sont critiques (même en production)
        // 2. forceShow est true (pour des cas spécifiques)
        // 3. Mode développeur activé (affiche toujours les alertes)
        const hasCriticalIssues = issues && issues.length > 0 && issues.some(issue => 
          issue.includes("WebAssembly") || 
          issue.includes("Web Workers")
        );
        
        setShouldShow(forceShow || developerMode || (hasCriticalIssues && issues.length > 0));
      } catch (error) {
        console.error("Erreur dans BrowserCompatibilityAlert:", error);
        // Par défaut, ne pas afficher en cas d'erreur
        setShouldShow(false);
      }
    }, [forceShow, issues, developerMode]);

    if (!isVisible || !issues || issues.length === 0 || !shouldShow) return null;

    // Déterminer si le navigateur est trop ancien ou incompatible
    const isOldBrowser = issues.some(issue => 
      issue.includes("WebAssembly") || 
      issue.includes("Web Workers")
    );

    // Simplifier les messages pour l'utilisateur final (mode client)
    // Mais afficher tous les détails en mode développeur
    const displayIssues = developerMode ? issues : issues.map(issue => {
      if (issue.includes("WebAssembly")) {
        return "Votre navigateur ne prend pas en charge les technologies modernes requises";
      }
      if (issue.includes("Web Workers")) {
        return "Votre navigateur ne prend pas en charge le traitement en arrière-plan";
      }
      if (issue.includes("SharedArrayBuffer")) {
        return "Performances réduites sur ce navigateur";
      }
      if (issue.includes("WebGPU")) {
        return "Accélération graphique non disponible";
      }
      return issue;
    });

    // Filtrer les doublons
    const uniqueIssues = [...new Set(displayIssues)];

    return (
      <div className={`fixed bottom-20 right-4 max-w-sm ${developerMode ? 'bg-amber-600' : 'bg-red-500'} text-white rounded-lg shadow-lg z-50 overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <h4 className="font-semibold">
                {developerMode ? "Diagnostic technique" : 
                  isOldBrowser ? "Navigateur non compatible" : "Fonctionnalités limitées"}
              </h4>
            </div>
            <button 
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-white/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          {developerMode ? (
            <>
              <p className="text-sm font-medium">Problèmes détectés (mode développeur):</p>
              <ul className="text-sm mt-1 list-disc pl-5 mb-2">
                {uniqueIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
              {isOldBrowser && (
                <div className="text-sm bg-amber-700/60 p-2 rounded mt-2">
                  <p className="font-semibold">⚠️ Incompatibilité critique détectée</p>
                  <p>Ce navigateur n'est pas compatible avec les fonctionnalités essentielles</p>
                </div>
              )}
            </>
          ) : isOldBrowser ? (
            <>
              <p className="text-sm">
                {clientMode
                  ? "Ce navigateur n'est pas compatible avec FileChat."
                  : "Votre navigateur n'est pas compatible avec les fonctionnalités requises par FileChat:"}
              </p>
              
              {!clientMode && (
                <ul className="text-sm mt-1 list-disc pl-5 mb-3">
                  {uniqueIssues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              )}
              
              <div className="text-sm">
                <p className="font-medium mb-2">Nous vous recommandons d'utiliser:</p>
                <ul className="list-disc pl-5 mb-3">
                  <li>Chrome (version récente)</li>
                  <li>Edge (version récente)</li>
                  <li>Firefox (version récente)</li>
                  <li>Safari (version récente)</li>
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
                {clientMode
                  ? "Certaines fonctionnalités pourraient être limitées dans ce navigateur."
                  : "Votre navigateur ne supporte pas toutes les fonctionnalités recommandées:"}
              </p>
              
              {!clientMode && (
                <ul className="text-sm mt-1 list-disc pl-5">
                  {uniqueIssues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    );
  } catch (error) {
    // En cas d'erreur, on log l'erreur et on ne bloque pas l'interface
    console.error("Erreur critique dans BrowserCompatibilityAlert:", error);
    return null;
  }
};
