import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Index from './pages/Index';
import AuthPage from './pages/Auth';
import ChatPage from './pages/Chat';
import DocumentsPage from './pages/Documents';
import ConfigPage from './pages/Config';
import { AuthProvider } from './components/AuthProvider';
import { DebugPanel } from './components/DebugPanel';
import SystemStatus from './pages/SystemStatus';
import LocalAISetup from './pages/LocalAISetup';

export default function App() {
  const [showDebugPanel, setShowDebugPanel] = useState(import.meta.env.DEV);

  return (
    <div className="flex flex-col min-h-screen">
      {showDebugPanel && <div className="absolute top-0 right-0 z-50"><DebugPanel /></div>}
      
      <div className="flex-1">
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:conversationId" element={<ChatPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="/config" element={<ConfigPage />} />
              <Route path="/system-status" element={<SystemStatus />} />
              <Route path="/local-ai-setup" element={<LocalAISetup />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </div>
  );
}
