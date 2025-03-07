
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Hook pour faciliter la navigation et la gestion des paramètres d'URL
 */
export const useNavigationHelpers = () => {
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Récupère les paramètres d'URL actuels
   */
  const getUrlParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      mode: params.get("mode") || "auto",
      client: params.get("client") === "true",
      forceCloud: params.get("forceCloud") === "true",
    };
  };

  /**
   * Génère un chemin de navigation en préservant les paramètres d'URL actuels
   */
  const getNavigationPath = (path: string) => {
    const params = new URLSearchParams(location.search);
    return `${path}?${params.toString()}`;
  };

  return { navigate, location, getUrlParams, getNavigationPath };
};
