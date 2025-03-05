
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

// Ce composant agit comme une redirection intelligente qui affiche Home
// tout en gérant les éventuels problèmes de navigation

export default function Index() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Vérifier si nous avons des problèmes de chargement
    const hasLoadingIssue = localStorage.getItem('app_loading_issue') === 'true';
    
    if (hasLoadingIssue) {
      // Réinitialiser l'indicateur de problème
      localStorage.removeItem('app_loading_issue');
      console.log('Navigation réinitialisée après problème de chargement');
    }
    
    // Enregistrer que nous avons accédé à la page d'index
    localStorage.setItem('last_route', '/');
  }, [navigate]);

  // Simplement rendre le composant Home
  return <Home />;
}
