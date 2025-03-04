
import React from "react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Chargement de Frenchat..." }: LoadingScreenProps) {
  return (
    <div className="loading-container bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="loading-spinner"></div>
      <h2 className="loading-text font-medium">{message}</h2>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        Si cette page reste affichée trop longtemps, veuillez rafraîchir.
      </p>
    </div>
  );
}
