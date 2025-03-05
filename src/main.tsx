
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initializeLovable } from './utils/lovable/editingUtils';

// Initialiser Lovable au démarrage de l'application
if (import.meta.env.MODE !== 'production') {
  console.log("Initialisation de l'environnement d'édition");
  initializeLovable();
}

// Obtenir l'élément racine
const rootElement = document.getElementById('root');

// Vérifier que l'élément existe
if (!rootElement) {
  console.error("Élément racine 'root' non trouvé dans le DOM");
} else {
  // Utiliser createRoot pour assurer la compatibilité avec React 18
  const root = ReactDOM.createRoot(rootElement);

  // Assurer que les composants sont rendus dans un environnement client (browser) pour éviter les problèmes de useLayoutEffect
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}
