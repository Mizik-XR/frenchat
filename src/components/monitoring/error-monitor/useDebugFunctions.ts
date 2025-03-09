
/**
 * Hook pour exposer des fonctions de débogage
 * Permet de récupérer et d'afficher les journaux d'erreurs depuis la console
 */
import { useEffect } from 'react';

export const useDebugFunctions = () => {
  useEffect(() => {
    // Exposer une fonction pour récupérer les journaux d'erreurs
    window.getFileCharErrorLogs = () => {
      try {
        const logs = localStorage.getItem('filechat_error_log');
        return logs ? JSON.parse(logs) : [];
      } catch (e) {
        console.error("Erreur lors de la récupération des journaux", e);
        return [];
      }
    };
    
    // Fonction pour effacer les journaux
    window.clearFileCharErrorLogs = () => {
      try {
        localStorage.removeItem('filechat_error_log');
        return true;
      } catch (e) {
        console.error("Erreur lors de la suppression des journaux", e);
        return false;
      }
    };
    
    // Fonction pour afficher les journaux dans la console
    window.printFileCharErrorLogs = () => {
      try {
        const logs = localStorage.getItem('filechat_error_log');
        const parsedLogs = logs ? JSON.parse(logs) : [];
        console.group("FileChat - Journaux d'erreurs");
        parsedLogs.forEach((log: string) => console.log(log));
        console.groupEnd();
        return parsedLogs.length;
      } catch (e) {
        console.error("Erreur lors de l'affichage des journaux", e);
        return 0;
      }
    };
    
    return () => {
      // Nettoyer les fonctions exposées
      delete window.getFileCharErrorLogs;
      delete window.clearFileCharErrorLogs;
      delete window.printFileCharErrorLogs;
    };
  }, []);
};

// Déclaration de type pour les méthodes globales
declare global {
  interface Window {
    getFileCharErrorLogs?: () => string[];
    clearFileCharErrorLogs?: () => boolean;
    printFileCharErrorLogs?: () => number;
  }
}
