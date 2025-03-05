
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

// Utiliser createRoot pour assurer la compatibilité avec React 18
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Assurer que StrictMode englobe toute l'application pour une meilleure détection d'erreurs
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
