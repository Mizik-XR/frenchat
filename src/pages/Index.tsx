
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';
import { useAuth } from "@/components/AuthProvider";
import { LoadingScreen } from '@/components/auth/LoadingScreen';

export default function Index() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(false);
  
  useEffect(() => {
    console.log("Index page loaded, user:", user ? "Authenticated" : "Not authenticated", "isLoading:", isLoading);
    
    // Stocker la route pour la gestion de session
    localStorage.setItem('last_route', '/');
    
    // Seulement rediriger après que le statut d'authentification soit confirmé
    if (!isLoading) {
      if (user) {
        console.log("Redirecting authenticated user to /chat");
        navigate('/chat');
      } else {
        console.log("User not authenticated, showing landing page");
        setShowLanding(true);
      }
    }
  }, [navigate, user, isLoading]);

  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (isLoading) {
    return <LoadingScreen message="Chargement de l'application..." />;
  }
  
  // Rendre la page d'accueil (Landing) si l'utilisateur n'est pas connecté et que le chargement est terminé
  if (showLanding) {
    return <Landing />;
  }
  
  // Écran de chargement par défaut pendant les transitions
  return <LoadingScreen message="Préparation de votre expérience..." />;
}
