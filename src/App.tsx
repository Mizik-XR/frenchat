
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

function AppWithAuth() {
  return (
    <AuthProvider fallback={
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-700">Chargement de l'application...</span>
      </div>
    }>
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

function App() {
  // Log pour comprendre si l'app se charge
  console.log("App component rendering");

  useEffect(() => {
    // Vérifier si les ressources Firebase sont accessibles
    console.log("Checking Firebase resources");
    
    // Loguer toute erreur de chargement des ressources
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      console.log(`Fetch request to: ${typeof input === 'string' ? input : input.url}`);
      return originalFetch(input, init)
        .then(response => {
          if (!response.ok) {
            console.warn(`Fetch error ${response.status} for ${typeof input === 'string' ? input : input.url}`);
          }
          return response;
        })
        .catch(error => {
          console.error(`Fetch failed for ${typeof input === 'string' ? input : input.url}:`, error);
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
