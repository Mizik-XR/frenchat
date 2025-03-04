
import { BrowserRouter } from "react-router-dom";
import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { Toaster } from "@/components/ui/toaster";
import { OnboardingIntro } from "./components/onboarding/OnboardingIntro";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./components/ThemeProvider";
import { WelcomePage } from "./components/onboarding/WelcomePage";
import { Suspense, lazy, useEffect, useState } from "react";
import { DebugPanel } from "./components/DebugPanel";
import { LoadingScreen } from "@/components/auth/LoadingScreen";
import { EnvironmentDetection } from "@/components/debug/EnvironmentDetection";

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

// Paramètres de la requête URL
const getUrlParams = () => {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  return {
    client: params.get('client') === 'true',
    hideDebug: params.get('hideDebug') === 'true',
    forceCloud: params.get('forceCloud') === 'true' || params.get('cloud') === 'true'
  };
};

function AppWithAuth() {
  const [appLoaded, setAppLoaded] = useState(false);
  const urlParams = getUrlParams();
  
  useEffect(() => {
    // Vérifier si mode cloud forcé
    if (urlParams.forceCloud) {
      console.log("Mode cloud forcé par paramètre URL");
      window.localStorage.setItem('FORCE_CLOUD_MODE', 'true');
      window.localStorage.setItem('aiServiceType', 'cloud');
    }
    
    // Marquer l'application comme chargée après le premier rendu
    setAppLoaded(true);
    
    // Précharger les pages principales après le montage initial
    window.requestIdleCallback 
      ? window.requestIdleCallback(preloadImportantPages) 
      : setTimeout(preloadImportantPages, 200);
  }, [urlParams.forceCloud]);

  if (!appLoaded) {
    return <LoadingScreen message="Initialisation de Frenchat" />;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="ui-theme">
      <AuthProvider>
        <OnboardingIntro />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Routes de base avec redirections cohérentes */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/index" element={<Navigate to="/" replace />} />
            <Route path="/home" element={<Index />} />
            
            {/* Routes d'authentification */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
            
            {/* Routes principales */}
            <Route path="/chat" element={<Chat />} />
            
            {/* Routes de configuration */}
            <Route path="/config" element={<Config />} />
            <Route path="/advanced-config" element={<AdvancedConfig />} />
            <Route path="/rag-advanced-settings" element={<RagAdvancedSettings />} />
            <Route path="/ai-config" element={<AIConfig />} />
            
            {/* Autres routes */}
            <Route path="/documents" element={<Documents />} />
            <Route path="/monitoring" element={<Monitoring />} />
            
            {/* Redirection pour les routes inconnues */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster />
        {!urlParams.hideDebug && <DebugPanel />}
      </AuthProvider>
    </ThemeProvider>
  );
}

function App() {
  // Log pour comprendre si l'app se charge
  console.log("App component rendering");

  // Définir le mode cloud par défaut si non spécifié
  useEffect(() => {
    if (!window.localStorage.getItem('aiServiceType')) {
      console.log("Mode cloud défini par défaut (première utilisation)");
      window.localStorage.setItem('aiServiceType', 'cloud');
    }
    
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
    
    // Loguer toute erreur de chargement des ressources
    const originalFetch = window.fetch;
    window.fetch = function(input, init) {
      const inputUrl = typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString();
      
      // Vérifier si c'est une requête API locale qui pourrait échouer
      const isLocalAPIRequest = (
        (inputUrl.includes('localhost:8000') || inputUrl.includes('127.0.0.1:8000')) &&
        !inputUrl.includes('supabase')
      );
      
      // Si c'est une requête locale et qu'on est en mode cloud forcé, annuler directement
      if (isLocalAPIRequest && window.localStorage.getItem('FORCE_CLOUD_MODE') === 'true') {
        console.log(`Requête API locale ignorée (mode cloud forcé): ${inputUrl}`);
        return Promise.reject(new Error('Mode cloud forcé activé'));
      }
      
      // Debug uniquement pour les requêtes API importantes
      if (inputUrl.includes('api') || inputUrl.includes('generate') || isLocalAPIRequest) {
        console.log(`Fetch request to: ${inputUrl}`);
      }
      
      return originalFetch(input, init)
        .then(response => {
          if (!response.ok && (inputUrl.includes('api') || isLocalAPIRequest)) {
            console.warn(`Fetch error ${response.status} for ${inputUrl}`);
          }
          return response;
        })
        .catch(error => {
          if (isLocalAPIRequest) {
            console.log(`Fetch failed for ${inputUrl}:`, error);
            console.log("Aucun service d'IA local détecté, utilisation du service cloud");
          } else if (inputUrl.includes('api')) {
            console.error(`Fetch failed for ${inputUrl}:`, error);
          }
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
        <EnvironmentDetection>
          <AppWithAuth />
        </EnvironmentDetection>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
