
/**
 * Module Resolver pour les fonctions Netlify
 * Permet de résoudre les problèmes d'importation entre ESM et CommonJS
 */

// Convertit un objet exporté par default dans ESM en CommonJS
function esmToCommonJS(esModule) {
  // Si le module a une propriété default, on la retourne
  if (esModule && typeof esModule === 'object' && 'default' in esModule) {
    return esModule.default;
  }
  return esModule;
}

// Convertit un objet CommonJS en format ESM
function commonJSToEsm(commonJSModule) {
  if (commonJSModule && typeof commonJSModule === 'object') {
    // Ajoute une propriété default si nécessaire
    return {
      ...commonJSModule,
      default: commonJSModule
    };
  }
  return { default: commonJSModule };
}

// Fonction pour charger de manière compatible ESM/CommonJS
async function compatibleRequire(modulePath) {
  try {
    // Essayer d'abord comme ESM
    const module = await import(modulePath);
    return module;
  } catch (error) {
    // Si ça échoue, essayer en CommonJS
    try {
      const module = require(modulePath);
      return commonJSToEsm(module);
    } catch (commonJSError) {
      console.error(`Failed to load module ${modulePath}:`, commonJSError);
      throw commonJSError;
    }
  }
}

module.exports = {
  esmToCommonJS,
  commonJSToEsm,
  compatibleRequire
};
