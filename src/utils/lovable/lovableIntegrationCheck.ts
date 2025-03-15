
/**
 * Utilité pour vérifier si l'intégration Lovable fonctionne correctement
 */

export function checkLovableIntegration(): boolean {
  try {
    // Vérifier si le script gptengineer.js est chargé
    const scripts = document.querySelectorAll('script');
    const lovableScript = Array.from(scripts).find(script => 
      script.src && script.src.includes('gptengineer.js')
    );
    
    if (!lovableScript) {
      console.warn("Script Lovable (gptengineer.js) non trouvé dans le DOM. L'édition pourrait ne pas fonctionner.");
      return false;
    }
    
    // Vérifier si window.__GPT_ENGINEER__ existe (ajouté par le script)
    if (typeof (window as any).__GPT_ENGINEER__ === 'undefined') {
      console.warn("L'objet global __GPT_ENGINEER__ n'est pas défini. Le script pourrait ne pas être chargé correctement.");
      return false;
    }
    
    console.log("Intégration Lovable vérifiée avec succès.");
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'intégration Lovable:", error);
    return false;
  }
}

/**
 * Ajoute le script Lovable s'il n'est pas déjà présent
 */
export function ensureLovableIntegration(): void {
  try {
    const scripts = document.querySelectorAll('script');
    const lovableScript = Array.from(scripts).find(script => 
      script.src && script.src.includes('gptengineer.js')
    );
    
    if (!lovableScript) {
      console.warn("Script Lovable manquant, tentative d'ajout dynamique...");
      const script = document.createElement('script');
      script.src = 'https://cdn.gpteng.co/gptengineer.js';
      script.type = 'module';
      document.head.appendChild(script);
      console.log("Script Lovable ajouté dynamiquement.");
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout du script Lovable:", error);
  }
}
