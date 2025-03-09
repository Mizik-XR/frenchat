
import React, { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster } from './components/ui/toaster';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { LoadingScreen } from './components/auth/LoadingScreen';

// Simplified: Lazy-load only essential components
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth'));
const Chat = lazy(() => import('./pages/Chat'));
const Index = lazy(() => import('./pages/Index'));
const Landing = lazy(() => import('./pages/Landing'));

// Component qui affiche un état de débogage simple
const DebugStatus = () => {
  const [messages, setMessages] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    // Journaliser quelques informations de base sur l'environnement
    const addMessage = (msg: string) => setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    
    addMessage(`Mode: ${process.env.NODE_ENV}`);
    addMessage(`Navigateur: ${navigator.userAgent}`);
    addMessage(`Fenêtre: ${window.innerWidth}×${window.innerHeight}`);
    addMessage(`Online: ${navigator.onLine ? 'Oui' : 'Non'}`);
    
    // Tester que les hooks React fonctionnent
    const interval = setInterval(() => {
      addMessage(`Test hook (${Math.floor(Math.random() * 100)})`);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-md max-w-md max-h-72 overflow-auto text-xs">
      <div className="font-bold mb-2">Statut d'initialisation:</div>
      <div className="space-y-1">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
    </div>
  );
};

const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Chargement simplifié de la page..." />}>
      <Routes>
        {/* Routes essentielles uniquement */}
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/landing" element={<Landing />} />
        
        {/* Route de secours */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DebugStatus />
    </Suspense>
  );
};

function App() {
  // Vérification que nous sommes dans un navigateur avant le rendu
  const isClient = typeof window !== 'undefined';
  
  console.log('🖼️ Rendu du composant App (version simplifiée)');
  
  // Si nous ne sommes pas dans un navigateur, renvoyer un contenu minimal
  if (!isClient) {
    return <div>Chargement de l'application...</div>;
  }

  return (
    <div className="app-container">
      {/* Structure simplifiée avec un minimum de providers */}
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
          <AuthProvider>
            <AppRouter />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
