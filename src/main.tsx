
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

// Configuration du client de requête avec optimisations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
})

// Fonction pour vérifier si React est correctement chargé
const checkReactDependencies = () => {
  if (typeof React === 'undefined') {
    console.warn("React n'est pas défini globalement - c'est normal avec les imports ES modules");
    return false;
  }
  return true;
}

// Affichage d'un message de chargement pour feedback immédiat
const showInitialLoadingMessage = () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; background: linear-gradient(to bottom right, #f0f9ff, #e1e7ff);">
        <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; width: 100%; text-align: center;">
          <h1 style="color: #4f46e5; font-size: 1.5rem; margin-bottom: 1rem;">FileChat - Chargement en cours</h1>
          <p style="margin-bottom: 1.5rem; color: #4b5563;">
            L'application est en cours de chargement. Veuillez patienter...
          </p>
          <div style="width: 100%; height: 6px; background-color: #e5e7eb; border-radius: 3px; overflow: hidden; margin-bottom: 1rem;">
            <div style="width: 30%; height: 100%; background-color: #4f46e5; border-radius: 3px; animation: progressAnimation 2s infinite ease-in-out;" id="loading-bar"></div>
          </div>
          <p style="font-size: 0.8rem; color: #6b7280;">
            Si le chargement prend trop de temps, essayez de rafraîchir la page.
          </p>
        </div>
      </div>
      <style>
        @keyframes progressAnimation {
          0% { width: 10%; }
          50% { width: 70%; }
          100% { width: 10%; }
        }
      </style>
    `;
  }
};

// Fonction pour gérer les erreurs de chargement
const handleLoadError = (error) => {
  console.error("Erreur critique lors du chargement de l'application:", error);
  
  // Afficher un message d'erreur utilisateur avec des options de récupération
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 2rem; background: linear-gradient(to bottom right, #f0f9ff, #e1e7ff);">
        <div style="background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); max-width: 500px; width: 100%;">
          <h1 style="color: #4f46e5; font-size: 1.5rem; margin-bottom: 1rem; text-align: center;">FileChat - Erreur de chargement</h1>
          <p style="margin-bottom: 1.5rem; color: #4b5563; text-align: center;">
            Une erreur est survenue lors du chargement de l'application.
          </p>
          <div style="background-color: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.8rem; color: #6b7280; overflow-x: auto;">
            ${error?.message || 'Erreur inconnue lors du chargement'}
            <br/>
            URL: ${window.location.href}
            <br/>
            Date: ${new Date().toLocaleString()}
          </div>
          <div style="text-align: center; display: flex; flex-direction: column; gap: 0.5rem;">
            <button onclick="window.location.reload()" style="background-color: #4f46e5; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500; margin-bottom: 0.5rem;">
              Rafraîchir la page
            </button>
            <button onclick="window.location.href = window.location.href + '?mode=fallback'" style="background-color: #fff; color: #4f46e5; border: 1px solid #4f46e5; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500;">
              Mode de secours
            </button>
            <button onclick="localStorage.clear(); window.location.reload()" style="background-color: #fff; color: #6b7280; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer; font-weight: 500; margin-top: 0.5rem;">
              Réinitialiser le stockage local
            </button>
          </div>
        </div>
      </div>
    `;
  }
};

// Vérifier les paramètres d'URL pour mode de secours
const checkForFallbackMode = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('mode') && urlParams.get('mode') === 'fallback';
};

// Création explicite d'un élément React pour éviter les erreurs avec useLayoutEffect
const setupReactDOM = () => {
  // Essayer d'importer React explicitement si nécessaire pour certains navigateurs
  try {
    // Cette technique n'est pas idéale mais peut aider dans certains cas
    if (window.React === undefined) {
      console.log("React n'est pas disponible globalement, cela peut causer des problèmes dans certains environnements");
    }
  } catch (e) {
    console.warn("Erreur lors de la vérification de React:", e);
  }
};

// Fonction pour démarrer l'application de manière robuste
const startApp = async () => {
  try {
    // Afficher un message de chargement pour feedback immédiat
    showInitialLoadingMessage();
    
    // Vérifier explicitement que React est disponible
    setupReactDOM();
    
    // Mode de secours (simplifié, sans tentatives de préchargement)
    const fallbackMode = checkForFallbackMode();
    
    // Vérification des paramètres Supabase en mode normal uniquement
    if (!fallbackMode) {
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
      // En mode de secours, on saute cette étape
      if (!fallbackMode) {
        try {
          await preloadSession();
          console.log("Session Supabase préchargée avec succès");
        } catch (err) {
          console.warn("Erreur non bloquante lors du préchargement de la session:", err);
          // On continue malgré l'erreur en mode normal
          // Notifier l'utilisateur uniquement si l'erreur est critique
          if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
            toast({
              title: "Problème de connexion",
              description: "Vérifiez votre connexion Internet ou réessayez plus tard.",
              variant: "destructive"
            });
          }
        }
      }
    } else {
      console.log("Mode de secours activé - certaines vérifications sont ignorées");
    }

    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
      throw new Error("Élément #root non trouvé dans le DOM");
    }
    
    console.log("Élément #root trouvé, montage de l'application React");
    
    // S'assurer que le DOM est complètement chargé
    const renderApp = () => {
      try {
        // S'assurer que createRoot est accessible
        if (typeof createRoot !== 'function') {
          console.error("react-dom/client createRoot n'est pas disponible, tentative de contournement...");
          throw new Error("react-dom/client createRoot n'est pas disponible");
        }
        
        const root = createRoot(rootElement);
        
        // Créer l'application dans un bloc try/catch pour détecter les erreurs de rendu
        try {
          root.render(
            <ErrorBoundary>
              <QueryClientProvider client={queryClient}>
                <App />
              </QueryClientProvider>
            </ErrorBoundary>
          );
          console.log("Application React montée avec succès");
        } catch (renderError) {
          console.error("Erreur pendant le rendu initial:", renderError);
          root.render(<LoadingScreen showRetry={true} message="Erreur lors du rendu de l'application" />);
          throw renderError;
        }
      } catch (rootError) {
        console.error("Erreur lors de la création du root React:", rootError);
        
        // Fallback à une méthode alternative si createRoot échoue
        try {
          console.warn("Tentative de contournement avec méthode alternative...");
          const element = document.createElement('div');
          element.innerHTML = '<div class="p-4 text-center"><h2>Mode de secours activé</h2><p>Chargement avec méthode alternative...</p></div>';
          rootElement.appendChild(element);
          
          setTimeout(() => {
            window.location.href = window.location.href + (window.location.href.includes('?') ? '&' : '?') + 'mode=fallback';
          }, 2000);
        } catch (fallbackError) {
          console.error("Même la méthode de contournement a échoué:", fallbackError);
        }
        
        throw rootError;
      }
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderApp);
    } else {
      renderApp();
    }
    
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
      try {
        createRoot(rootElement).render(<LoadingScreen showRetry={true} message="Chargement prolongé..." />);
      } catch (error) {
        // Si même le rendering du LoadingScreen échoue, on affiche un message HTML basique
        rootElement.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; text-align: center;">
            <h2>Chargement prolongé</h2>
            <p>L'application prend plus de temps que prévu à démarrer.</p>
            <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background-color: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Réessayer
            </button>
            <button onclick="window.location.href = window.location.href + '?mode=fallback'" style="margin-top: 10px; padding: 10px 20px; background-color: white; color: #4f46e5; border: 1px solid #4f46e5; border-radius: 4px; cursor: pointer;">
              Mode de secours
            </button>
          </div>
        `;
      }
    }
  }
}, 10000); // 10 secondes avant d'afficher l'écran de chargement prolongé

// Démarrer l'application
startApp().then(() => {
  appStarted = true;
  clearTimeout(safetyTimeout);
}).catch(error => {
  clearTimeout(safetyTimeout);
  handleLoadError(error);
});
