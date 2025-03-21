
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ChatPage } from '@/pages/Chat';
import { ConfigPage } from '@/pages/Config';
import { Auth } from '@/pages/Auth';
import { Landing } from '@/pages/Landing';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:conversationId" element={<ChatPage />} />
              <Route path="/config" element={<ConfigPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/:tab" element={<Auth />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Toaster />
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
