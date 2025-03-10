
import React, { Suspense, lazy } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { Toaster } from './components/ui/toaster';

// Composant de chargement simple
const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
      <div className="animate-pulse flex space-x-4 mb-4 justify-center">
        <div className="rounded-full bg-blue-400 h-12 w-12"></div>
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Chargement en cours...</h2>
      <p className="text-gray-500">Veuillez patienter pendant le chargement de la page.</p>
    </div>
  </div>
);

// Lazy-load des composants essentiels
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth'));
const Chat = lazy(() => import('./pages/Chat'));
const Index = lazy(() => import('./pages/Index'));
const Landing = lazy(() => import('./pages/Landing'));

// Component qui affiche un état de debug simple
const DebugStatus = () => {
  const [messages, setMessages] = React.useState<string[]>([]);
  
  React.useEffect(() => {
    const addMessage = (msg: string) => setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    
    addMessage(`Mode: ${process.env.NODE_ENV}`);
    addMessage(`Navigateur: ${navigator.userAgent}`);
    addMessage(`Fenêtre: ${window.innerWidth}×${window.innerHeight}`);
    addMessage(`Online: ${navigator.onLine ? 'Oui' : 'Non'}`);
    
    return () => {};
  }, []);
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-md max-w-md max-h-72 overflow-auto text-xs">
      <div className="font-bold mb-2">Statut:</div>
      <div className="space-y-1">
        {messages.map((msg, i) => (
          <div key={i}>{msg}</div>
        ))}
      </div>
    </div>
  );
};

// Composant principal de routage
const AppRouter = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/home" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DebugStatus />
    </Suspense>
  );
};

// Composant App principal
function App() {
  console.log('🖼️ Rendu du composant App');
  
  return (
    <div className="app-container">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
