
import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import Auth from "./pages/Auth";
import Chat from "./pages/Chat";
import Config from "./pages/Config";
import AdvancedConfig from "./pages/AdvancedConfig";
import Documents from "./pages/Documents";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import Index from "./pages/Index";
import Monitoring from "./pages/Monitoring";
import AIConfig from "./pages/AIConfig";
import RagAdvancedSettings from "./pages/RagAdvancedSettings";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/config" element={<Config />} />
        <Route path="/advanced-config" element={<AdvancedConfig />} />
        <Route path="/rag-advanced-settings" element={<RagAdvancedSettings />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
        <Route path="/monitoring" element={<Monitoring />} />
        <Route path="/ai-config" element={<AIConfig />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
