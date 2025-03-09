
import React, { useState, useEffect } from 'react';
import { checkGifAvailability } from '@/utils/startup/loadingUtils';
import { isNetlifyEnvironment } from '@/utils/environment/environmentDetection';

interface LogoImageProps {
  className?: string;
}

export const LogoImage = ({ className = "h-10 w-10" }: LogoImageProps) => {
  const [imagePath, setImagePath] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [errorCount, setErrorCount] = useState<number>(0);
  
  useEffect(() => {
    // Utiliser l'utilitaire pour trouver le chemin de l'image avec mise en cache
    const gifPath = checkGifAvailability();
    const isNetlify = isNetlifyEnvironment();
    
    if (gifPath) {
      // Précharger l'image pour vérifier si elle se charge correctement
      const img = new Image();
      
      img.onload = () => {
        setImagePath(gifPath);
        setImageLoaded(true);
        
        if (import.meta.env.DEV) {
          console.log(`GIF chargé avec succès depuis: ${gifPath}`);
        }
      };
      
      img.onerror = () => {
        setErrorCount(prev => prev + 1);
        
        if (import.meta.env.DEV) {
          console.warn(`Échec du chargement du GIF depuis: ${gifPath} (tentative ${errorCount+1})`);
        }
        
        setImageLoaded(false);
        
        // Stratégie de repli adaptée selon l'environnement
        if (errorCount < 2) {
          // Essayer avec un chemin absolu en cas d'échec initial
          const fallbackPath = isNetlify 
            ? './filechat-animation.gif' // Sur Netlify, essayer un chemin relatif simple
            : `${window.location.origin}/filechat-animation.gif`; // En local, essayer avec l'origine complète
            
          if (fallbackPath !== gifPath) {
            const fallbackImg = new Image();
            fallbackImg.onload = () => {
              setImagePath(fallbackPath);
              setImageLoaded(true);
              
              if (import.meta.env.DEV) {
                console.log(`GIF chargé avec succès depuis le chemin alternatif: ${fallbackPath}`);
              }
            };
            fallbackImg.onerror = () => {
              if (import.meta.env.DEV) {
                console.warn(`Échec du chargement du GIF depuis tous les chemins connus`);
              }
              setImageLoaded(false);
            };
            fallbackImg.src = fallbackPath;
          }
        } else {
          if (import.meta.env.DEV) {
            console.warn(`Abandon du chargement du GIF après ${errorCount} tentatives`);
          }
        }
      };
      
      img.src = gifPath;
    } else {
      if (import.meta.env.DEV) {
        console.warn("Aucun chemin de GIF valide trouvé");
      }
      setImageLoaded(false);
    }
  }, [errorCount]);

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
        if (import.meta.env.DEV) {
          console.warn(`Erreur lors du chargement de l'image: ${imagePath}`);
        }
        setImageLoaded(false);
      }}
    />
  );
};
