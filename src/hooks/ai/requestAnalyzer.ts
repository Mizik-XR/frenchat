
/**
 * Module central pour l'analyse de requêtes et capacités système
 * Ce fichier regroupe les importations des modules d'analyse
 */

import { analyzeRequest } from './analyzers/requestAnalysis';
import { estimateSystemCapabilities } from './analyzers/systemCapabilities';
import { checkBrowserCompatibility } from './analyzers/browserCompatibility';

export { 
  analyzeRequest,
  estimateSystemCapabilities,
  checkBrowserCompatibility
};
