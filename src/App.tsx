import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import Chat from './pages/Chat';
import DocumentView from './pages/DocumentView';
import Auth from './pages/Auth';
import Config from './pages/Config';
import Home from './pages/Home';
import AdvancedConfig from './pages/AdvancedConfig';
import GoogleDrive from './pages/GoogleDrive';
import Indexing from './pages/Indexing';
import DatabaseView from './pages/DatabaseView';
import Debug from './pages/Debug';
import { ToastProvider } from './hooks/use-toast';
import { ThemeProvider } from './components/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsProvider } from './contexts/SettingsContext';
import OllamaSetup from './pages/OllamaSetup';

const queryClient = new QueryClient();

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/config" element={<Config />} />
      <Route path="/config/advanced" element={<AdvancedConfig />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/document/:id" element={<DocumentView />} />
      <Route path="/google-drive" element={<GoogleDrive />} />
      <Route path="/indexing" element={<Indexing />} />
      <Route path="/database" element={<DatabaseView />} />
      <Route path="/debug" element={<Debug />} />
      <Route path="/ollama-setup" element={<OllamaSetup />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SettingsProvider>
              <Router>
                <AppRouter />
              </Router>
            </SettingsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
