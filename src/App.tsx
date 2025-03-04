
import { BrowserRouter } from "react-router-dom";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { OnboardingIntro } from "./components/onboarding/OnboardingIntro";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";
import { WelcomePage } from "./components/onboarding/WelcomePage";
import { Suspense, lazy, useEffect } from "react";
import { DebugPanel } from "./components/DebugPanel";
import { LoadingScreen } from "@/components/auth/LoadingScreen";

// Lazy load pages pour améliorer le temps de chargement initial
const Auth = lazy(() => import("./pages/Auth"));
const Chat = lazy(() => import("./pages/Chat"));
const Config = lazy(() => import("./pages/Config"));
const AdvancedConfig = lazy(() => import("./pages/AdvancedConfig"));
const Documents = lazy(() => import("./pages/Documents"));
const GoogleAuthCallback = lazy(() => import("./pages/GoogleAuthCallback"));
const Index = lazy(() => import("./pages/Index"));
const Monitoring = lazy(() => import("./pages/Monitoring"));
const AIConfig = lazy(() => import("./pages/AIConfig"));
const RagAdvancedSettings = lazy(() => import("./pages/RagAdvancedSettings"));

// Préchargez les pages les plus importantes dès que possible
const preloadImportantPages = () => {
  const importantPages = [
    import("./pages/Index"),
    import("./pages/Auth"),
    import("./pages/Chat")
  ];
  
  // Exécuter les imports en arrière-plan
  Promise.all(importantPages).catch(error => 
    console.warn("Préchargement des pages échoué:", error)
  );
};

function AppWithAuth() {
  useEffect(() => {
    // Précharger les pages principales après le montage initial
    window.requestIdleCallback 
      ? window.requestIdleCallback(preloadImportantPages) 
      : setTimeout(preloadImportantPages, 200);
    
    console.log("AppWithAuth is mounted, current location:", window.location.pathname);
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <AuthProvider>
        <OnboardingIntro />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/index" element={<WelcomePage />} />
            <Route path="/home" element={<Index />} />
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
        </Suspense>
        <Toaster />
        <DebugPanel />
      </AuthProvider>
    </ThemeProvider>
  );
}

function App() {
  // Log pour comprendre si l'app se charge
  console.log("App component rendering");

  useEffect(() => {
    // Précharger les routes importantes dès que possible
    preloadImportantPages();
    
    // Afficher l'URL actuelle pour le débogage
    console.log("Current environment:", 
      window.location.hostname.includes('preview') || window.location.hostname.includes('lovable') 
        ? "Preview environment" 
        : "Local environment");
    console.log("Current URL:", window.location.href);
    console.log("Current hostname:", window.location.hostname);
    console.log("Current origin:", window.location.origin);
    console.log("Current pathname:", window.location.pathname);
    
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
    <ErrorBoundary>
      <BrowserRouter>
        <AppWithAuth />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
