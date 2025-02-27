
import { BrowserRouter } from "react-router-dom";
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
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { DebugPanel } from "./components/DebugPanel";

function AppWithAuth() {
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
      <DebugPanel />
    </AuthProvider>
  );
}

function App() {
  // Log pour comprendre si l'app se charge
  console.log("App component rendering");

  useEffect(() => {
    // Afficher l'URL actuelle pour le débogage
    console.log("Current environment:", 
      window.location.hostname.includes('preview') || window.location.hostname.includes('lovable') 
        ? "Preview environment" 
        : "Local environment");
    console.log("Current URL:", window.location.href);
    console.log("Current hostname:", window.location.hostname);
    console.log("Current origin:", window.location.origin);
    
    // Loguer toute erreur de chargement des ressources
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const inputUrl = typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString();
      console.log(`Fetch request to: ${inputUrl}`);
      return originalFetch(input, init)
        .then(response => {
          if (!response.ok) {
            console.warn(`Fetch error ${response.status} for ${inputUrl}`);
          }
          return response;
        })
        .catch(error => {
          console.error(`Fetch failed for ${inputUrl}:`, error);
          throw error;
        });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return (
    <BrowserRouter>
      <AppWithAuth />
    </BrowserRouter>
  );
}

export default App;
