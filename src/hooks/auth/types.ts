
import { Location, NavigateFunction } from "react-router-dom";

/**
 * Type pour les helpers de navigation
 */
export interface NavigationHelpers {
  navigate: NavigateFunction;
  location: Location;
  getUrlParams: () => { mode: string; client: boolean; forceCloud: boolean };
  getNavigationPath: (path: string) => string;
}
