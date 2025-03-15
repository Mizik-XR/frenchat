
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
import { ToastProvider } from '@/hooks/toast/toast-context';
import * as RadixToast from '@radix-ui/react-toast';

// Lazy-loaded components
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

// Configurer le client de requête
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Chargement de la page..." />}>
      <Routes>
        <Route path="/" element={<Index />} />
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
        <Route path="/features" element={<Navigate to="/landing?section=features" replace />} />
        <Route path="/how-it-works" element={<Navigate to="/landing?section=how-it-works" replace />} />
        <Route path="/examples" element={<Navigate to="/landing?section=examples" replace />} />
        <Route path="/pricing" element={<Navigate to="/landing?section=pricing" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/ai" element={<Navigate to="/config" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

function App() {
  const isClient = typeof window !== 'undefined';

  if (!isClient) {
    return <div>Chargement de l'application...</div>;
  }

  // Enregistrer une détection d'erreur globale
  window.addEventListener('error', (event) => {
    console.error('Global error detected:', event.message);
    if (event.message.includes('vendor-')) {
      console.warn('Vendor script error detected. This might be related to a known issue with module initialization order.');
    }
  });

  return (
    <ErrorBoundary>
      {/* Utiliser RadixToast.Provider pour gérer le viewport et le swipe */}
      <RadixToast.Provider swipeDirection="right">
        <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AuthProvider>
                <SettingsProvider>
                  {/* Notre ToastProvider pour la gestion d'état */}
                  <ToastProvider>
                    <ReactErrorMonitor />
                    <AppRouter />
                    <Toaster />
                    {/* Viewport pour les toasts */}
                    <RadixToast.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
                  </ToastProvider>
                </SettingsProvider>
              </AuthProvider>
            </BrowserRouter>
          </QueryClientProvider>
        </ThemeProvider>
      </RadixToast.Provider>
    </ErrorBoundary>
  );
}

export default App;
