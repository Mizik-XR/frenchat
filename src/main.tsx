
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { checkLovableIntegration, ensureLovableIntegration } from './utils/lovable/lovableIntegrationCheck';

// Vérifier et assurer l'intégration de Lovable
ensureLovableIntegration();

// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', () => {
  // Vérifier l'intégration de Lovable
  checkLovableIntegration();
  
  // Rendre l'application
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
