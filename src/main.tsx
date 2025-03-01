
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { preloadSession } from '@/integrations/supabase/client'

// Log pour débogage
console.log("Initialisation de l'application...")

// Précharger la session Supabase pendant le chargement initial
preloadSession().catch(console.error)

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

// Élément racine avec gestion d'erreur améliorée
const rootElement = document.getElementById("root")

if (!rootElement) {
  console.error("Élément #root non trouvé dans le DOM")
} else {
  console.log("Élément #root trouvé, montage de l'application React")
  
  try {
    const root = createRoot(rootElement)
    
    root.render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    )
    
    console.log("Application React montée avec succès")
  } catch (error) {
    console.error("Erreur lors du montage de l'application:", error)
    
    // Afficher une erreur utilisateur pour informer en cas de problème
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 2rem; text-align: center;">
        <h1 style="color: #e11d48; margin-bottom: 1rem;">Une erreur est survenue</h1>
        <p>Nous n'avons pas pu charger l'application correctement. Veuillez rafraîchir la page ou réessayer plus tard.</p>
        <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background-color: #6366f1; color: white; border: none; border-radius: 0.25rem; cursor: pointer;">
          Rafraîchir la page
        </button>
      </div>
    `
  }
}
