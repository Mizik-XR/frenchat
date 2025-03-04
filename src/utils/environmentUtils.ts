
/**
 * Ce fichier est maintenu pour la rétrocompatibilité.
 * Il réexporte toutes les fonctions des modules environnement refactorisés.
 * 
 * Pour les nouveaux développements, veuillez importer directement depuis les modules spécifiques:
 * - @/utils/environment/environmentDetection
 * - @/utils/environment/urlUtils
 * - @/utils/environment/cloudModeUtils
 * 
 * Ou importez depuis le module index:
 * - @/utils/environment
 */

// Réexporter toutes les fonctions pour maintenir la compatibilité
export * from './environment/index';
