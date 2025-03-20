
import { React, ReactDOM } from "./core/ReactInstance";
import App from "./App";
import "./index.css";
import { initLovableIntegration } from "./utils/lovable/lovableIntegration";

// Initialiser l'intégration Lovable avant tout
initLovableIntegration();

// Rendre l'application
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Exposer une fonction de diagnostic Lovable globale
if (typeof window !== 'undefined') {
  // Ajouter la fonction au window
  (window as any).runLovableDiagnostic = function() {
    // Vérifier si le script Lovable est chargé
    const scriptExists = document.querySelector('script[src*="gptengineer.js"]');
    console.log('Script Lovable présent:', Boolean(scriptExists));
    
    // S'il n'est pas présent, tenter de l'injecter
    if (!scriptExists) {
      console.log('Tentative d\'injection du script Lovable...');
      const script = document.createElement('script');
      script.src = 'https://cdn.gpteng.co/gptengineer.js';
      script.type = 'module';
      document.head.appendChild(script);
      return 'Script injecté. Rechargez la page.';
    }
    
    // Vérifier la présence de l'objet global
    const hasGlobal = Boolean(window.GPTEngineer || window.__GPTEngineer);
    console.log('Objet global Lovable présent:', hasGlobal);
    
    return 'Diagnostic terminé. ' + (hasGlobal ? 'Tout semble correct.' : 'L\'objet global n\'est pas détecté.');
  };
}
