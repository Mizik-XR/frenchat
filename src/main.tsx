
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { setupGlobalErrorHandlers } from './utils/errorHandlingUtils'

// Configurer les gestionnaires d'erreurs globaux
setupGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
