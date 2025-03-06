
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';
import { useAuth } from "@/components/AuthProvider";

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    console.log("Index page loaded, user:", user ? "Authenticated" : "Not authenticated");
    
    // Si l'utilisateur est connecté, le rediriger vers le tableau de bord
    if (user) {
      console.log("Redirecting authenticated user to /chat");
      navigate('/chat');
      return;
    }
    
    // Enregistrer que nous avons accédé à la page d'index
    localStorage.setItem('last_route', '/');
  }, [navigate, user]);

  // Rendre la page d'accueil (Landing) si l'utilisateur n'est pas connecté
  return <Landing />;
}
