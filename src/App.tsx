
import React, { Suspense, lazy } from 'react';
import { Route, Routes, Navigate, BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { LoadingScreen } from './components/auth/LoadingScreen';
import { Toaster } from './components/ui/toaster';
import { ThemeProvider } from './components/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsProvider } from './contexts/SettingsContext';
import { ReactErrorMonitor } from './components/monitoring/ReactErrorMonitor';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './hooks/use-toast';

// Importation différée des composants pour améliorer les performances de chargement initial
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth').then(module => ({ default: module.Auth })));
const Config = lazy(() => import('./pages/Config'));
const AdvancedConfig = lazy(() => import('./pages/AdvancedConfig'));
const Chat = lazy(() => import('./pages/Chat'));
const DocumentView = lazy(() => import('./pages/DocumentView'));
const GoogleDrive = lazy(() => import('./pages/GoogleDrive'));
const Indexing = lazy(() => import('./pages/Indexing'));
const DatabaseView = lazy(() => import('./pages/DatabaseView'));
const Debug = lazy(() => import('./pages/Debug'));
const OllamaSetup = lazy(() => import('./pages/OllamaSetup'));
const Index = lazy(() => import('./pages/Index'));
const Landing = lazy(() => import('./pages/Landing'));

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
        {/* Route racine - affiche Index qui décidera de rediriger ou d'afficher Landing */}
        <Route path="/" element={<Index />} />
        
        {/* Landing est maintenant rendu via Index quand nécessaire, pas besoin d'une route séparée */}
        
        {/* Routes importantes */}
        <Route path="/home" element={<Home />} />
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
        
        {/* Routes pour la navigation marketing (redirigent vers les routes appropriées) */}
        <Route path="/features" element={<Navigate to="/landing?section=features" replace />} />
        <Route path="/how-it-works" element={<Navigate to="/landing?section=how-it-works" replace />} />
        <Route path="/examples" element={<Navigate to="/landing?section=examples" replace />} />
        <Route path="/pricing" element={<Navigate to="/landing?section=pricing" replace />} />
        
        {/* Nouvelle route explicite pour Landing quand accédée directement */}
        <Route path="/landing" element={<Landing />} />
        
        {/* Nouvelle route pour /ai qui redirige vers la page de configuration IA */}
        <Route path="/ai" element={<Navigate to="/config" replace />} />
        
        {/* Route de secours pour les chemins inconnus */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  // Vérification que nous sommes dans un navigateur avant le rendu complet
  const isClient = typeof window !== 'undefined';
  
  // Si nous ne sommes pas dans un navigateur, renvoyer un contenu minimal
  if (!isClient) {
    return <div>Chargement de l'application...</div>;
  }

  return (
    <ErrorBoundary>
      {/* L'ordre des providers est crucial pour le bon fonctionnement */}
      <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
        {/* Nous mettons ToastProvider avant le BrowserRouter pour éviter les problèmes
            de contexte avec ToastViewport */}
        <ToastProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AuthProvider>
                <SettingsProvider>
                  <ReactErrorMonitor />
                  <AppRouter />
                  <Toaster />
                </SettingsProvider>
              </AuthProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
