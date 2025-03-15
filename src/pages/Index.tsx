
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingScreen } from '@/components/auth/LoadingScreen';
import Landing from './Landing';
import { useAuth } from '@/components/AuthProvider';
import { ToastTester } from '@/components/debug/ToastTester';

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowLanding, setShouldShowLanding] = useState(true);
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Si l'authentification est toujours en cours, on attend
    if (isAuthLoading) return;

    // En mode développement, regarder les paramètres
    const isDevelopment = process.env.NODE_ENV === 'development';
    const hasSeenLanding = localStorage.getItem('hasSeenLanding') === 'true';
    const forceLanding = new URLSearchParams(window.location.search).get('landing') === 'true';
    
    console.log("Index page: Auth status:", user ? "Logged in" : "Not logged in", 
                "isDevelopment:", isDevelopment, 
                "hasSeenLanding:", hasSeenLanding,
                "forceLanding:", forceLanding);

    // Logique de redirection
    if (user) {
      // Utilisateur connecté -> redirection vers /home
      navigate('/home', { replace: true });
    } else if (forceLanding || !hasSeenLanding || isDevelopment) {
      // Forcer la landing page ou nouvel utilisateur ou mode dev -> afficher landing
      setShouldShowLanding(true);
      // Ne pas mettre à jour hasSeenLanding en mode dev pour toujours voir la landing
      if (!isDevelopment && !forceLanding) {
        localStorage.setItem('hasSeenLanding', 'true');
      }
    } else {
      // Utilisateur non connecté qui a déjà vu la landing page -> redirection vers /auth
      navigate('/auth', { replace: true });
    }

    setIsLoading(false);
  }, [user, isAuthLoading, navigate]);

  if (isLoading || isAuthLoading) {
    return <LoadingScreen message="Préparation de votre environnement..." />;
  }

  // Afficher la landing page si nécessaire
  if (shouldShowLanding) {
    return (
      <div>
        <Landing />
        <div className="fixed bottom-4 right-4 z-50">
          <ToastTester />
        </div>
      </div>
    );
  }

  // Ce code ne devrait jamais être atteint car nous redirigeons toujours
  return <LoadingScreen message="Redirection en cours..." />;
};

export default Index;
