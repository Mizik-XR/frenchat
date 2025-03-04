
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ErrorFallbackProps {
  error?: Error;
  resetErrorBoundary?: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const handleRefresh = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Une erreur est survenue
        </h2>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md mb-4">
          <p className="text-sm text-red-800 dark:text-red-300">
            {error?.message || "Erreur inattendue lors du chargement de l'application"}
          </p>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          <p>Veuillez essayer de rafraîchir la page. Si le problème persiste, contactez le support technique.</p>
        </div>
        
        <Button 
          onClick={handleRefresh}
          className="w-full flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Rafraîchir la page</span>
        </Button>
      </div>
    </div>
  );
}
