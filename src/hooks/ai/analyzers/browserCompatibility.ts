
/**
 * Vérifie la compatibilité du navigateur avec les fonctionnalités requises
 * pour l'exécution locale des modèles AI
 */
export const checkBrowserCompatibility = (): {
  compatible: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Vérifier la compatibilité des API Web modernes
  if (!window.fetch) issues.push("Fetch API non supportée");
  if (!window.WebSocket) issues.push("WebSockets non supportés");
  if (!window.indexedDB) issues.push("IndexedDB non supporté");
  
  // Vérifier la compatibilité des fonctionnalités ES6+ essentielles
  try {
    // Test des fonctions arrow, async/await, et destructuring
    eval("const test = async () => { const {a, b} = {a: 1, b: 2}; await Promise.resolve(); }");
  } catch (e) {
    issues.push("JavaScript moderne (ES6+) non supporté");
  }
  
  return {
    compatible: issues.length === 0,
    issues
  };
};
