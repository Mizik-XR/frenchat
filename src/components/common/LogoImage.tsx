
import React, { useState, useEffect } from 'react';
import { isNetlifyEnvironment } from '@/utils/environment/environmentDetection';
import customPlaceholder from '../../assets/custom-placeholder.svg';

interface LogoImageProps {
  className?: string;
}

export const LogoImage = ({ className = "h-10 w-10" }: LogoImageProps) => {
  const [imagePath, setImagePath] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    // Stocker des logs dans localStorage pour diagnostic
    const logImageAttempt = (message: string, data?: any) => {
      try {
        const logs = JSON.parse(localStorage.getItem('filechat_image_logs') || '[]');
        logs.push(`${new Date().toISOString()} - ${message}${data ? ': ' + JSON.stringify(data) : ''}`);
        localStorage.setItem('filechat_image_logs', JSON.stringify(logs.slice(-50)));
      } catch (e) {
        console.warn('Impossible de stocker les logs d\'image:', e);
      }
    };

    // Détection de l'environnement Netlify
    const isNetlify = isNetlifyEnvironment();
    logImageAttempt(`LogoImage: environnement détecté`, { isNetlify, hostname: window.location.hostname });
    
    // Chemins possibles pour l'image, optimisés pour différents environnements
    const possiblePaths = [];
    
    // Sur Netlify, essayer d'abord les chemins relatifs puis les chemins absolus
    if (isNetlify) {
      // Chemins relatifs pour Netlify (prioritaires)
      possiblePaths.push(
        './filechat-animation.gif',
        './assets/filechat-animation.gif', 
        '../filechat-animation.gif',
        '../assets/filechat-animation.gif',
        // Utiliser l'image de placeholder personnalisée comme option de secours
        customPlaceholder
      );
      
      // Chemins absolus basés sur l'origine pour Netlify (secours)
      const origin = window.location.origin;
      possiblePaths.push(
        `${origin}/filechat-animation.gif`,
        `${origin}/assets/filechat-animation.gif`
      );
    } else {
      // En local ou autre environnement
      possiblePaths.push(
        '/filechat-animation.gif',
        '/assets/filechat-animation.gif',
        './filechat-animation.gif',
        // Utiliser l'image de placeholder personnalisée comme option de secours
        customPlaceholder
      );
    }
    
    logImageAttempt('Tentative de chargement d\'image avec chemins', possiblePaths);
    
    // Fonction pour tester séquentiellement les chemins d'image
    const testImagePaths = async () => {
      for (const path of possiblePaths) {
        try {
          const img = new Image();
          
          // Promesse pour attendre le chargement ou l'erreur
          const result = await new Promise<boolean>((resolve) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = path;
          });
          
          if (result) {
            logImageAttempt('Image chargée avec succès', { path });
            setImagePath(path);
            setImageLoaded(true);
            return; // Sortir de la boucle si l'image est chargée
          } else {
            logImageAttempt('Échec du chargement', { path });
          }
        } catch (error) {
          logImageAttempt('Erreur lors du test de chemin', { path, error: error?.toString() });
        }
      }
      
      // Si aucun chemin ne fonctionne, utiliser notre placeholder personnalisé
      logImageAttempt('Tous les chemins ont échoué, utilisation du placeholder personnalisé');
      setImagePath(customPlaceholder);
      setImageLoaded(true);
    };
    
    // Démarrer les tests de chemins
    testImagePaths();
    
    // Définir un délai maximum pour le chargement
    const timer = setTimeout(() => {
      if (!imageLoaded) {
        logImageAttempt('Délai de chargement dépassé, utilisation du placeholder personnalisé');
        setImagePath(customPlaceholder);
        setImageLoaded(true);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Utiliser notre composant de secours mais avec l'image de placeholder personnalisée
  if (!imageLoaded) {
    return (
      <div className={`flex items-center justify-center bg-blue-100 rounded-full ${className}`}>
        <span className="text-blue-600 font-bold">FC</span>
      </div>
    );
  }

  return (
    <img
      src={imagePath}
      alt="FileChat Logo"
      className={className}
      onError={() => {
        console.warn(`LogoImage: erreur de chargement depuis ${imagePath}`);
        setImagePath(customPlaceholder);
        setImageLoaded(true);
      }}
    />
  );
};
