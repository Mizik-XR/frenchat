
/**
 * Module central pour l'analyse de requêtes et capacités système
 * Ce fichier regroupe les importations des modules d'analyse
 */

import { analyzeRequest } from './analyzers/requestAnalysis';
import { estimateSystemCapabilities } from './analyzers/systemCapabilities';
import { checkBrowserCompatibility } from './analyzers/browserCompatibility';
import { testResponseTime, estimateNetworkSpeed } from './analyzers/networkAnalyzer';
import { detectBrowser, getNetworkType } from './analyzers/browserAnalyzer';
import { testCloudService, determineRecommendedMode } from './analyzers/serviceAnalyzer';

export { 
  analyzeRequest,
  estimateSystemCapabilities,
  checkBrowserCompatibility,
  testResponseTime,
  estimateNetworkSpeed,
  detectBrowser,
  getNetworkType,
  testCloudService,
  determineRecommendedMode
};
