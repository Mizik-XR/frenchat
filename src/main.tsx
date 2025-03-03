
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { preloadSession } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingScreen } from '@/components/auth/LoadingScreen'

// Log pour débogage
console.log("Initialisation de l'application...")

// Vérification de la version de React
const ReactVersion = require('react').version;
console.log("Version de React utilisée:", ReactVersion);

// Configuration du client de requête avec optimisations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      // Ajouter une stratégie de cache pour améliorer la performance
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false, // Désactiver les refetch automatiques
    },
  },
})

// Fonction pour gérer les erreurs de chargement
const handleLoadError = (error: any) => {
  console.error("Erreur critique lors du chargement de l'application:", error);
  
  // Afficher un message d'erreur utilisateur
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; background: linear-gradient(to bottom right, #f0f9ff, #e1e7ff);">
        <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; width: 100%;">
          <h1 style="color: #4f46e5; font-size: 1.5rem; margin-bottom: 1rem; text-align: center;">FileChat - Erreur de chargement</h1>
          <p style="margin-bottom: 1.5rem; color: #4b5563; text-align: center;">
            Une erreur est survenue lors du chargement de l'application. Veuillez rafraîchir la page ou réessayer plus tard.
          </p>
          <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.8rem; color: #6b7280; overflow-x: auto;">
            ${error?.message || 'Erreur inconnue lors du chargement'}
            <br/>
            URL: ${window.location.href}
            <br/>
            Date: ${new Date().toLocaleString()}
          </div>
          <div style="text-align: center;">
            <button onclick="window.location.reload()" style="background-color: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
              Rafraîchir la page
            </button>
          </div>
        </div>
      </div>
    `;
  }
};

// Fonction pour démarrer l'application
const startApp = async () => {
  try {
    // Vérification des paramètres Supabase
    const supabaseUrl = "https://dbdueopvtlanxgumenpu.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiZHVlb3B2dGxhbnhndW1lbnB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NzQ0NTIsImV4cCI6MjA1NTU1MDQ1Mn0.lPPbNJANU8Zc7i5OB9_atgDZ84Yp5SBjXCiIqjA79Tk";
    
    console.log("Vérification des paramètres Supabase:", {
      url: supabaseUrl ? "Définie" : "Non définie",
      key: supabaseKey ? "Définie" : "Non définie"
    });
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Les paramètres Supabase sont manquants");
    }
    
    // Précharger la session Supabase pendant le chargement initial
    await preloadSession().catch(err => {
      console.error("Erreur lors du préchargement de la session:", err);
      // Notifier l'utilisateur uniquement si l'erreur est critique
      if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
        toast({
          title: "Problème de connexion",
          description: "Vérifiez votre connexion Internet ou réessayez plus tard.",
          variant: "destructive"
        });
      }
    });

    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
      throw new Error("Élément #root non trouvé dans le DOM");
    }
    
    console.log("Élément #root trouvé, montage de l'application React");
    
    const root = createRoot(rootElement);
    
    root.render(
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ErrorBoundary>
    );
    
    console.log("Application React montée avec succès");
    
    // Surveiller les problèmes de connexion
    window.addEventListener('online', () => {
      toast({
        title: "Connexion rétablie",
        description: "Votre connexion Internet a été rétablie."
      });
    });
    
    window.addEventListener('offline', () => {
      toast({
        title: "Connexion perdue",
        description: "Votre connexion Internet semble interrompue.",
        variant: "destructive"
      });
    });
    
  } catch (error) {
    console.error("Erreur lors du montage de l'application:", error);
    handleLoadError(error);
  }
};

// Essayer de démarrer l'application avec timeout de sécurité
let appStarted = false;
const safetyTimeout = setTimeout(() => {
  if (!appStarted) {
    const rootElement = document.getElementById("root");
    if (rootElement) {
      createRoot(rootElement).render(<LoadingScreen showRetry={true} message="Chargement prolongé..." />);
    }
  }
}, 5000);

// Démarrer l'application
startApp().then(() => {
  appStarted = true;
  clearTimeout(safetyTimeout);
}).catch(error => {
  clearTimeout(safetyTimeout);
  handleLoadError(error);
});
