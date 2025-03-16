
import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Composant de chargement simple
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
    <div className="p-6 bg-white rounded-lg shadow-lg text-center">
      <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700">Chargement...</h2>
    </div>
  </div>
);

// Import différé des pages pour éviter les dépendances circulaires
const Landing = React.lazy(() => import('./pages/Landing'));
const AuthPage = React.lazy(() => import('./pages/Auth'));
const ChatPage = React.lazy(() => import('./pages/Chat'));
const DocumentsPage = React.lazy(() => import('./pages/Documents'));
const ConfigPage = React.lazy(() => import('./pages/Config'));
const SystemStatus = React.lazy(() => import('./pages/SystemStatus'));
const LocalAISetup = React.lazy(() => import('./pages/LocalAISetup'));

export default function App() {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    // Configuration de base et activation du mode cloud par défaut
    localStorage.setItem('FORCE_CLOUD_MODE', 'true');
    localStorage.setItem('aiServiceType', 'cloud');
    
    // Indiquer que l'application est prête
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <LoadingFallback />;
  }

  // Utilisation de Suspense pour gérer le chargement des composants
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:conversationId" element={<ChatPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="/system-status" element={<SystemStatus />} />
          <Route path="/local-ai-setup" element={<LocalAISetup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}
