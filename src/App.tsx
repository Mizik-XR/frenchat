
import React, { useEffect } from 'react';
import { Routes, Route, useLocation, BrowserRouter } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Documents from './pages/Documents';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Legal from './pages/Legal';
import NotFound from './pages/NotFound';
import Pricing from './pages/Pricing';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { getAllUrlParams } from '@/utils/environment/urlUtils';

// Lazy-loaded component for installation docs
const InstallationDocs = React.lazy(() => import('./pages/InstallationDocs'));

function App() {
  const { user, isLoading } = useSupabaseUser();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Récupérer les paramètres d'URL
    const urlParams = getAllUrlParams();

    // Afficher un toast si l'utilisateur revient d'un OAuth flow
    if (urlParams.oauth === 'true') {
      toast({
        title: "Authentification réussie !",
        description: "Vous êtes maintenant connecté.",
      });
    }
  }, [location.search, toast]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route 
          path="/docs/installation" 
          element={
            <React.Suspense fallback={<div>Chargement...</div>}>
              <InstallationDocs />
            </React.Suspense>
          } 
        />
        <Route path="/documents" element={<Documents />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
