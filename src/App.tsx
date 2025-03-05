
import React, { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { LoadingScreen } from './components/auth/LoadingScreen';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsProvider } from './contexts/SettingsContext';
import { ReactErrorMonitor } from './components/monitoring/ReactErrorMonitor';
import { ErrorBoundary } from './components/ErrorBoundary';

// Importation différée des composants pour améliorer les performances de chargement initial
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth'));
const Config = lazy(() => import('./pages/Config'));
const AdvancedConfig = lazy(() => import('./pages/AdvancedConfig'));
const Chat = lazy(() => import('./pages/Chat'));
const DocumentView = lazy(() => import('./pages/DocumentView'));
const GoogleDrive = lazy(() => import('./pages/GoogleDrive'));
const Indexing = lazy(() => import('./pages/Indexing'));
const DatabaseView = lazy(() => import('./pages/DatabaseView'));
const Debug = lazy(() => import('./pages/Debug'));
const OllamaSetup = lazy(() => import('./pages/OllamaSetup'));

// Créer une nouvelle instance QueryClient avec configuration de retry
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Chargement de la page..." />}>
      <Routes>
        {/* Définir explicitement la racine comme Home sans redirection */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/index" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/config" element={<Config />} />
        <Route path="/config/advanced" element={<AdvancedConfig />} />
        <Route path="/advanced" element={<AdvancedConfig />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/document/:id" element={<DocumentView />} />
        <Route path="/google-drive" element={<GoogleDrive />} />
        <Route path="/indexing" element={<Indexing />} />
        <Route path="/database" element={<DatabaseView />} />
        <Route path="/debug" element={<Debug />} />
        <Route path="/ollama-setup" element={<OllamaSetup />} />
        {/* Nouvelle route pour /ai qui redirige vers la page de configuration IA */}
        <Route path="/ai" element={<Navigate to="/config" replace />} />
        {/* Route de secours pour l'accueil si d'autres routes sont utilisées */}
        {/* Capture les routes inconnues */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
      {/* L'ordre des providers est important */}
      <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
        <QueryClientProvider client={queryClient}>
          {/* Wrap AuthProvider autour de SettingsProvider pour éviter les problèmes de contexte */}
          <AuthProvider>
            <SettingsProvider>
              <ReactErrorMonitor />
              <AppRouter />
              <Toaster />
            </SettingsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
