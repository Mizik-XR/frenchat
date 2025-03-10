
import React, { useState, useEffect, useRef } from 'react';
import { checkGifAvailability } from '@/utils/startup/loadingUtils';

interface LogoImageProps {
  className?: string;
}

export const LogoImage = ({ className = "h-10 w-10" }: LogoImageProps) => {
  const [imagePath, setImagePath] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  
  useEffect(() => {
    // Utiliser l'utilitaire pour trouver le chemin de l'image
    const gifPath = checkGifAvailability();
    if (gifPath) {
      setImagePath(gifPath);
      
      // Précharger l'image pour vérifier si elle se charge correctement
      const img = new Image();
      img.onload = () => {
        setImageLoaded(true);
        console.log(`GIF chargé avec succès depuis: ${gifPath}`);
      };
      img.onerror = () => {
        console.error(`Échec du chargement du GIF depuis: ${gifPath}`);
        setImageLoaded(false);
        
        // Essayer avec un chemin absolu
        const absolutePath = `${window.location.origin}/filechat-animation.gif`;
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setImagePath(absolutePath);
          setImageLoaded(true);
          console.log(`GIF chargé avec succès depuis le chemin absolu: ${absolutePath}`);
        };
        fallbackImg.onerror = () => {
          console.error(`Échec du chargement du GIF même avec le chemin absolu: ${absolutePath}`);
          setImageLoaded(false);
        };
        fallbackImg.src = absolutePath;
      };
      img.src = gifPath;
    } else {
      console.warn("Aucun chemin de GIF valide trouvé");
      setImageLoaded(false);
    }
  }, []);

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
        console.error(`Erreur lors du chargement de l'image: ${imagePath}`);
        setImageLoaded(false);
      }}
    />
  );
};
