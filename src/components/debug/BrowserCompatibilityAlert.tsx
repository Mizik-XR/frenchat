import { AlertCircle, X, Check, Info, AlertTriangle, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface BrowserCompatibilityAlertProps {
  issues: string[];
  forceShow?: boolean;
  clientMode?: boolean; // Mode client (simplifié)
  developerMode?: boolean; // Mode développeur (détaillé)
  onDismiss?: () => void;
  onRunDiagnostic?: () => void;
}

export const BrowserCompatibilityAlert = ({ 
  issues = [], // Valeur par défaut pour éviter les erreurs
  forceShow = false,
  clientMode = true,
  developerMode = false,
  onDismiss,
  onRunDiagnostic
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
          issue.includes("Web Workers") ||
          issue.includes("Fetch")
        );
        
        setShouldShow(forceShow || developerMode || (hasCriticalIssues && issues.length > 0));
      } catch (error) {
        console.error("Erreur dans BrowserCompatibilityAlert:", error);
        // Par défaut, ne pas afficher en cas d'erreur
        setShouldShow(false);
      }
    }, [forceShow, issues, developerMode]);

    // Si l'alerte est invisible ou vide, ne rien afficher
    if (!isVisible || !issues || issues.length === 0 || !shouldShow) return null;

    // Vérifier si on est dans un environnement Netlify / Preview
    const isNetlifyOrPreview = window.location.hostname.includes('netlify') || 
                              window.location.hostname.includes('lovableproject.com');

    // Déterminer si le navigateur est trop ancien ou incompatible
    const isOldBrowser = issues.some(issue => 
      issue.includes("WebAssembly") || 
      issue.includes("Web Workers") ||
      issue.includes("Fetch")
    );

    // Traiter l'environnement spécifique (Lovable preview, Netlify, local)
    const isSpecialEnvironment = isNetlifyOrPreview;

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
      if (issue.includes("Fetch")) {
        return "Votre navigateur ne peut pas effectuer de requêtes réseau modernes";
      }
      return issue;
    });

    // Filtrer les doublons
    const uniqueIssues = [...new Set(displayIssues)];

    // Déterminer le message adapté à l'environnement
    let title = isOldBrowser 
      ? "Navigateur non compatible" 
      : "Fonctionnalités limitées";
    
    let message = isOldBrowser
      ? isSpecialEnvironment 
        ? "Les limitations de cet environnement réduisent les fonctionnalités disponibles."
        : "Ce navigateur n'est pas compatible avec certaines fonctionnalités avancées."
      : "Certaines fonctionnalités avancées pourraient être limitées.";

    // Si nous sommes dans un environnement Lovable, personnaliser le message
    if (isNetlifyOrPreview) {
      title = "Environnement de prévisualisation";
      message = "Cette prévisualisation a des limitations techniques qui désactivent certaines fonctionnalités.";
    }

    const handleClose = () => {
      setIsVisible(false);
      if (onDismiss) {
        onDismiss();
      }
    };

    return (
      <div className={`fixed bottom-4 right-4 max-w-md ${developerMode ? 'bg-amber-600' : (isOldBrowser ? 'bg-red-500' : 'bg-blue-500')} text-white rounded-lg shadow-lg z-50 overflow-hidden`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {developerMode ? (
                <Info className="h-5 w-5" />
              ) : isOldBrowser ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <h4 className="font-semibold">{title}</h4>
            </div>
            <button 
              onClick={handleClose}
              className="text-white hover:text-white/80 transition-colors"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <p className="text-sm mb-3">{message}</p>
          
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
              {onRunDiagnostic && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="mt-3 bg-white text-amber-600 hover:bg-white/90 w-full"
                  onClick={onRunDiagnostic}
                >
                  Lancer un diagnostic complet
                </Button>
              )}
            </>
          ) : isOldBrowser ? (
            <>
              <p className="text-sm mb-2">
                Dans un environnement de production, nous vous recommandons d'utiliser:
              </p>
              
              <ul className="text-sm mt-1 list-disc pl-5 mb-3">
                <li>Chrome (version récente)</li>
                <li>Edge (version récente)</li>
                <li>Firefox (version récente)</li>
                <li>Safari (version récente)</li>
              </ul>
              
              {isNetlifyOrPreview ? (
                <div className="text-sm bg-red-600/40 p-2 rounded mb-3">
                  <p>Dans cet environnement de prévisualisation, certaines fonctionnalités ne seront pas disponibles.</p>
                </div>
              ) : null}
              
              <div className="flex gap-2 mt-3">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white text-red-500 hover:bg-white/90 w-full flex items-center gap-1"
                  onClick={() => window.open("https://www.google.com/chrome/", "_blank")}
                >
                  <ExternalLink className="h-4 w-4" />
                  Obtenir un navigateur compatible
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white text-red-500 hover:bg-white/90 w-full"
                  onClick={handleClose}
                >
                  Continuer quand même
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-white/90">
                L'application fonctionnera, mais avec des fonctionnalités réduites:
              </p>
              
              <ul className="text-sm mt-1 list-disc pl-5 text-white/90">
                {uniqueIssues.length > 0 ? 
                  uniqueIssues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  )) : 
                  <li>Certaines fonctionnalités d'IA locale pourraient être limitées</li>
                }
              </ul>
              
              <div className="mt-3">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-white/20 text-white hover:bg-white/30 w-full"
                  onClick={handleClose}
                >
                  J'ai compris
                </Button>
              </div>
            </div>
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

export const testSupabaseConnection = async () => {
  const results = {
    supabaseUrl: "https://dbdueopvtlanxgumenpu.supabase.co",
    supabaseKeyDefined: true,
    fetchTest: false,
    clientInitialized: false,
    sessionTest: false,
    error: null as string | null
  };
  
  try {
    // Tester la connexion à Supabase
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Vérifier si le client est correctement initialisé
    results.clientInitialized = !!supabase;
    
    if (!supabase) {
      throw new Error("Client Supabase non initialisé");
    }
    
    // Tester la récupération de la session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    results.sessionTest = true;
    
    // Tester une requête fetch simple
    const fetchResponse = await fetch(results.supabaseUrl);
    results.fetchTest = fetchResponse.ok;
    
    return {
      success: true,
      results
    };
  } catch (error: any) {
    results.error = error?.message || "Erreur inconnue";
    console.error("Test de connexion Supabase échoué:", error);
    
    return {
      success: false,
      results,
      error: error?.message || "Erreur inconnue"
    };
  }
};
