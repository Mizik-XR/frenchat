
import React, { useState, useEffect, useRef } from 'react';

interface LogoImageProps {
  className?: string;
}

export const LogoImage = ({ className = "h-10 w-10" }: LogoImageProps) => {
  const [imagePath, setImagePath] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [initialAnimationPlayed, setInitialAnimationPlayed] = useState<boolean>(false);
  const animationTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Déterminer si nous sommes en environnement de développement ou de production
    const isDevEnvironment = process.env.NODE_ENV === 'development' || 
                             window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
    
    // Chemins à essayer, en commençant par celui approprié pour l'environnement
    let paths = isDevEnvironment 
      ? [
          "/filechat-animation.gif",
          "./filechat-animation.gif", 
          "filechat-animation.gif",
          "/public/filechat-animation.gif",
          "./public/filechat-animation.gif"
        ]
      : [
          // En production, on essaie d'abord les chemins relatifs à la racine du site
          "./filechat-animation.gif",
          "/filechat-animation.gif", 
          "filechat-animation.gif"
        ];
    
    // Tester la charge de l'image avec chaque chemin
    const testImage = (path: string) => {
      return new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve(true);
        };
        img.onerror = () => {
          resolve(false);
        };
        img.src = path;
      });
    };

    const findWorkingPath = async () => {
      // D'abord, essayons les chemins relatifs normaux
      for (const path of paths) {
        const success = await testImage(path);
        if (success) {
          setImagePath(path);
          setImageLoaded(true);
          return;
        }
      }
      
      // Si ça ne fonctionne pas, essayons avec un chemin complet basé sur l'origine de la page
      const baseUrl = window.location.origin;
      const fullPaths = paths.map(path => {
        // Si le chemin commence déjà par /, supprimer le / initial pour éviter les doubles slashes
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${baseUrl}/${cleanPath}`;
      });
      
      for (const path of fullPaths) {
        const success = await testImage(path);
        if (success) {
          setImagePath(path);
          setImageLoaded(true);
          return;
        }
      }
      
      // Si rien ne fonctionne, essayer le fichier depuis les uploads Lovable s'il existe
      const lovablePath = './public/lovable-uploads/filechat-animation.gif';
      const success = await testImage(lovablePath);
      if (success) {
        setImagePath(lovablePath);
        setImageLoaded(true);
        return;
      }
    };

    findWorkingPath();
  }, []);

  // Fonction pour "figer" l'animation du GIF
  const pauseAnimation = () => {
    if (imageRef.current && imageRef.current.src && imageLoaded) {
      // On sauvegarde l'URL originale du GIF
      const currentSrc = imageRef.current.src;
      
      // On remplace temporairement par une image vide pour interrompre l'animation
      imageRef.current.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      
      // Puis on remet l'URL originale (qui sera maintenant "figée" à la dernière frame)
      setTimeout(() => {
        if (imageRef.current) {
          imageRef.current.src = currentSrc;
        }
      }, 30);
    }
  };

  // Gérer l'animation initiale une seule fois
  useEffect(() => {
    if (imageLoaded && !initialAnimationPlayed) {
      // Arrêter l'animation après la durée souhaitée
      const timer = setTimeout(() => {
        if (!isHovering) {
          pauseAnimation();
          setInitialAnimationPlayed(true);
        }
      }, 2000); // Durée de l'animation initiale
      
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, initialAnimationPlayed, isHovering]);

  // Gestion du hover pour rejouer l'animation
  const handleMouseEnter = () => {
    setIsHovering(true);
    
    if (imageRef.current && imageLoaded) {
      // Forcer le rechargement du GIF pour relancer l'animation
      const currentSrc = imageRef.current.src;
      const timestamp = new Date().getTime();
      imageRef.current.src = currentSrc.split('?')[0] + '?t=' + timestamp;
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    
    // Arrêter l'animation après un délai pour qu'elle se termine proprement
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    animationTimeoutRef.current = window.setTimeout(() => {
      pauseAnimation();
    }, 2000); // Laisser l'animation se terminer avant de la figer
  };

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
      ref={imageRef}
      src={imagePath}
      alt="FileChat Logo"
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onLoad={() => {
        // Si c'est le premier chargement et pas un rechargement au hover
        if (!initialAnimationPlayed) {
          // On laisse l'animation initiale se jouer, puis on la fige
          setTimeout(() => {
            if (!isHovering) {
              pauseAnimation();
              setInitialAnimationPlayed(true);
            }
          }, 2000);
        }
      }}
      onError={() => {
        setImageLoaded(false);
      }}
    />
  );
};
