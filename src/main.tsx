
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Log pour débogage
console.log("Initialisation de l'application...");

// Configuration du client de requête
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

// Élément racine
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Élément #root non trouvé dans le DOM");
} else {
  console.log("Élément #root trouvé, montage de l'application React");
  
  try {
    const root = createRoot(rootElement);
    
    root.render(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    );
    
    console.log("Application React montée avec succès");
  } catch (error) {
    console.error("Erreur lors du montage de l'application:", error);
  }
}
