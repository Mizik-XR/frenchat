
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';
import { useAuth } from "@/components/AuthProvider";
import { LoadingScreen } from '@/components/auth/LoadingScreen';

export default function Index() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [showLanding, setShowLanding] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Logger pour le débogage
  useEffect(() => {
    console.log("Index page initialized", {
      isLoading,
      user: user ? "Authenticated" : "Not authenticated"
    });
    
    // Stocker la route pour la gestion de session
    try {
      localStorage.setItem('last_route', '/');
    } catch (e) {
      console.warn("Impossible de stocker la route dans localStorage:", e);
    }
  }, []);

  // Séparation de la logique de redirection pour éviter les problèmes de séquence
  useEffect(() => {
    if (!isLoading) {
      setAuthChecked(true);
      if (user) {
        console.log("Redirecting authenticated user to /chat");
        navigate('/chat');
      } else {
        console.log("User not authenticated, showing landing page");
        setShowLanding(true);
      }
    }
  }, [navigate, user, isLoading]);

  // Protection contre l'erreur "Cannot update during an existing state transition"
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("Auth still loading after timeout, showing landing page as fallback");
        setShowLanding(true);
      }
    }, 5000); // Délai de sécurité de 5 secondes
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  // Afficher un écran de chargement pendant la vérification de l'authentification
  if (isLoading && !authChecked && !showLanding) {
    return <LoadingScreen message="Chargement de l'application..." />;
  }
  
  // Rendre la page d'accueil (Landing) si l'utilisateur n'est pas connecté et que le chargement est terminé
  if (showLanding) {
    return <Landing />;
  }
  
  // Écran de chargement par défaut pendant les transitions
  return <LoadingScreen message="Préparation de votre expérience..." />;
}
