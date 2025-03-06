
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';
import { useAuth } from "@/components/AuthProvider";

// Ce composant agit comme une redirection intelligente vers la landing page
// ou vers le tableau de bord selon l'état de connexion

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // Si l'utilisateur est connecté, le rediriger vers le tableau de bord
    if (user) {
      navigate('/chat');
    }
    
    // Vérifier si nous avons des problèmes de chargement
    const hasLoadingIssue = localStorage.getItem('app_loading_issue') === 'true';
    
    if (hasLoadingIssue) {
      // Réinitialiser l'indicateur de problème
      localStorage.removeItem('app_loading_issue');
      console.log('Navigation réinitialisée après problème de chargement');
    }
    
    // Enregistrer que nous avons accédé à la page d'index
    localStorage.setItem('last_route', '/');
  }, [navigate, user]);

  // Rendre la page d'accueil si l'utilisateur n'est pas connecté
  return <Landing />;
}
