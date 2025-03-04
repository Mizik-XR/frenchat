
import { TextGenerationParameters } from '../types';

/**
 * Valide les paramètres d'entrée utilisateur pour la génération de texte
 * @param options Les paramètres de génération de texte
 * @returns Null si valide, sinon un message d'erreur
 */
export function validateTextGenerationInput(options: TextGenerationParameters): string | null {
  if (!options.prompt || typeof options.prompt !== 'string') {
    return "Format de prompt invalide";
  }
  
  if (options.prompt.length > 10000) {
    return "Prompt trop long (maximum 10000 caractères)";
  }
  
  if (options.max_length && (options.max_length < 1 || options.max_length > 4096)) {
    return "Nombre de tokens invalide (doit être entre 1 et 4096)";
  }
  
  if (options.temperature && (options.temperature < 0 || options.temperature > 2)) {
    return "Température invalide (doit être entre 0 et 2)";
  }
  
  return null;
}
