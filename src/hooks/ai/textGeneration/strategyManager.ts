
import { AIServiceType, TextGenerationParameters } from '../types';

/**
 * Analyse la complexité de la requête pour déterminer le meilleur service à utiliser
 */
function analyzeRequestComplexity(options: TextGenerationParameters): 'simple' | 'complex' {
  const prompt = options.prompt || options.inputs || '';
  
  // Facteurs indiquant une requête complexe
  const complexityFactors = [
    prompt.length > 800, // Prompt long
    prompt.includes("génère un document") || prompt.includes("créer un document"),
    prompt.includes("tableau") && prompt.includes("données"),
    prompt.includes("analyse") && prompt.includes("détaillée"),
    prompt.includes("explique en détail") || prompt.includes("explique-moi en détail"),
    prompt.includes("comparer") && prompt.includes("différentes"),
    prompt.includes("résumer") && prompt.length > 500
  ];
  
  // Si au moins deux facteurs de complexité sont présents, considérer comme complexe
  return complexityFactors.filter(Boolean).length >= 2 ? 'complex' : 'simple';
}

/**
 * Détermine la stratégie d'exécution appropriée
 */
export async function determineExecutionStrategy(
  options: TextGenerationParameters,
  serviceType: AIServiceType
): Promise<'local' | 'cloud'> {
  // Option forcée localement
  if (options.forceLocal === true) {
    return 'local';
  }
  
  // Option forcée vers le cloud
  if (options.forceCloud === true) {
    return 'cloud';
  }
  
  // Si mode hybride (auto), analyser la complexité pour décider
  if (serviceType === 'hybrid') {
    const complexity = analyzeRequestComplexity(options);
    console.log(`Mode automatique: Complexité détectée: ${complexity}`);
    return complexity === 'complex' ? 'cloud' : 'local';
  }
  
  // Utiliser le type de service configuré
  if (serviceType === 'local') {
    return 'local';
  } else if (serviceType === 'cloud') {
    return 'cloud';
  }
  
  // Par défaut, utiliser le cloud
  return 'cloud';
}
