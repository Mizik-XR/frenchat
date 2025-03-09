
import React, { useState, useEffect } from 'react';

/**
 * Version minimale de l'application pour tester l'initialisation
 * Sans Sentry, sans providers complexes, sans router
 */
function AppMinimal() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Simuler un chargement d'initialisation
    console.log("AppMinimal: useEffect exécuté");
    
    try {
      // Vérification simple des APIs du navigateur
      if (typeof window === 'undefined') {
        throw new Error("Window n'est pas défini");
      }
      
      if (!document || !document.getElementById) {
        throw new Error("Document n'est pas correctement initialisé");
      }
      
      // Marquer comme initialisé après vérifications
      setTimeout(() => {
        console.log("AppMinimal: Initialisation terminée avec succès");
        setInitialized(true);
      }, 500);
      
    } catch (err) {
      console.error("AppMinimal: Erreur lors de l'initialisation", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, []);

  // Afficher un message d'erreur si quelque chose ne va pas
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 border border-red-200">
          <h1 className="text-xl font-bold text-red-600 mb-4">Erreur d'initialisation</h1>
          <div className="bg-red-50 p-3 rounded border border-red-100 mb-4">
            <p className="text-red-800 font-mono text-sm">{error.message}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Recharger l'application
          </button>
        </div>
      </div>
    );
  }

  // Afficher un écran de chargement pendant l'initialisation
  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation de l'application simplifiée...</p>
        </div>
      </div>
    );
  }

  // Application principale simplifiée
  return (
    <div className="min-h-screen bg-gray-50 p-4 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Filechat (Version minimale)</h1>
        
        <div className="my-6 border-t border-gray-200"></div>
        
        <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-100">
          <h2 className="text-lg font-medium text-green-800 mb-2">✅ Application initialisée avec succès</h2>
          <p className="text-green-700 text-sm">
            Cette version minimale fonctionne correctement, ce qui confirme que le problème 
            provient d'une dépendance ou d'un provider plus complexe.
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button 
            onClick={() => {
              console.log("Bouton de diagnostic cliqué");
              alert("Votre navigateur: " + navigator.userAgent);
            }}
            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Diagnostic
          </button>
          
          <button 
            onClick={() => window.location.href = "/"}
            className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Version complète
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        Version minimaliste pour diagnostiquer les problèmes d'initialisation
      </p>
    </div>
  );
}

export default AppMinimal;
