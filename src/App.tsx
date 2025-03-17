
// Importation correcte de React depuis l'instance centrale
import { React } from '@/core/ReactInstance';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactErrorMonitor } from './components/monitoring/ReactErrorMonitor';
import { SettingsProvider } from './contexts/SettingsContext';
import Chat from './pages/Chat';
import Config from './pages/Config';
import { GoogleDriveConfig } from './components/config/GoogleDriveConfig';

// Ajouter un composant de diagnostic pour le mode dev
const DevTools = () => {
  // Ne rendre qu'en mode développement
  if (import.meta.env.PROD) return null;
  
  const runDiagnostic = () => {
    // Importer dynamiquement pour éviter les problèmes en production
    import('./utils/diagnostics/diagnoseApp')
      .then(module => module.diagnoseApplication())
      .catch(err => console.error('Erreur lors du chargement du diagnostic:', err));
  };
  
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      zIndex: 9999,
      opacity: 0.8,
    }}>
      <button
        onClick={runDiagnostic}
        style={{
          background: '#6366f1',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        Diagnostic
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <ReactErrorMonitor />
            <Routes>
              <Route path="/" element={<Chat />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/config" element={<Config />} />
              <Route path="/config/google-drive" element={<GoogleDriveConfig config={{}} onConfigChange={() => {}} onSave={() => {}} />} />
            </Routes>
            <Toaster />
            {import.meta.env.DEV && <DevTools />}
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
