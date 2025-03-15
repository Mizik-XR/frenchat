import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
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
import { getFormattedUrlParams, getAllUrlParams } from '@/utils/environment/urlUtils';

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
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/docs/installation" element={React.lazy(() => import('./pages/InstallationDocs'))} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
