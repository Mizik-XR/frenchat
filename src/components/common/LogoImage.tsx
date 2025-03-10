
import React, { useState, useEffect } from 'react';
import { isNetlifyEnvironment } from '@/utils/environment/environmentDetection';

interface LogoImageProps {
  className?: string;
}

export const LogoImage = ({ className = "h-10 w-10" }: LogoImageProps) => {
  const [imagePath, setImagePath] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    // Liste des chemins possibles pour l'image
    const isNetlify = isNetlifyEnvironment();
    console.log('LogoImage: isNetlify =', isNetlify);
    
    // Sur Netlify, privilégier les chemins relatifs
    const possiblePaths = isNetlify 
      ? ['./filechat-animation.gif', './assets/filechat-animation.gif'] 
      : ['/filechat-animation.gif', '/assets/filechat-animation.gif', './filechat-animation.gif'];
    
    // Fonction pour tester un chemin d'image
    const testImagePath = (path: string) => {
      console.log('LogoImage: testing path', path);
      const img = new Image();
      img.onload = () => {
        console.log('LogoImage: path loaded successfully', path);
        setImagePath(path);
        setImageLoaded(true);
      };
      img.onerror = () => {
        console.warn('LogoImage: failed to load from path', path);
      };
      img.src = path;
    };
    
    // Tester chaque chemin séquentiellement
    possiblePaths.forEach(path => {
      if (!imageLoaded) {
        testImagePath(path);
      }
    });
    
    // Si aucun chemin ne fonctionne après un délai, utiliser le fallback
    const timer = setTimeout(() => {
      if (!imageLoaded) {
        console.warn('LogoImage: fallback to simple component after timeout');
        setImageLoaded(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [imageLoaded]);

  // Utiliser une icône de secours si l'image ne charge pas
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
        console.warn(`LogoImage: error loading image from ${imagePath}`);
        setImageLoaded(false);
      }}
    />
  );
};
