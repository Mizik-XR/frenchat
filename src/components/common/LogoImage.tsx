
import React, { useState, useEffect, useRef } from 'react';

interface LogoImageProps {
  className?: string;
}

export const LogoImage = ({ className = "h-10 w-10" }: LogoImageProps) => {
  const [imagePath, setImagePath] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);

  // État pour suivre si l'animation initiale a été jouée
  const [initialAnimationPlayed, setInitialAnimationPlayed] = useState<boolean>(false);

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
    
    console.log(`Environnement: ${isDevEnvironment ? 'développement' : 'production'}`);
    console.log(`Chemin de base: ${window.location.origin}`);
    
    // Tester la charge de l'image avec chaque chemin
    const testImage = (path: string) => {
      return new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => {
          console.log(`Image chargée avec succès depuis: ${path}`);
          resolve(true);
        };
        img.onerror = () => {
          console.log(`Échec du chargement depuis: ${path}`);
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

      console.error("Impossible de charger l'image depuis aucun chemin");
    };

    findWorkingPath();
  }, []);

  // Effet pour gérer l'animation initiale une seule fois
  useEffect(() => {
    if (imageLoaded && imageRef.current && !initialAnimationPlayed) {
      // Permettre à l'animation de démarrer une fois
      const img = imageRef.current;
      
      // Utiliser une timeout pour s'assurer que l'animation est terminée
      // La plupart des animations GIF durent quelques secondes
      const timeoutId = setTimeout(() => {
        // Arrêter l'animation en remplaçant le src avec lui-même
        // Cela fige le GIF sur sa dernière frame
        if (img && img.src && !isHovering) {
          const currentSrc = img.src;
          // On recharge l'image pour arrêter l'animation
          img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Image vide
          img.src = currentSrc;
          setInitialAnimationPlayed(true);
        }
      }, 3000); // Durée estimée de l'animation (ajuster selon la durée réelle du GIF)
      
      return () => clearTimeout(timeoutId);
    }
  }, [imageLoaded, initialAnimationPlayed, isHovering]);

  // Gestion du hover pour rejouer l'animation
  const handleMouseEnter = () => {
    setIsHovering(true);
    if (imageRef.current && initialAnimationPlayed) {
      // Recharger l'image pour relancer l'animation
      const img = imageRef.current;
      const currentSrc = img.src;
      img.src = currentSrc;
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Lorsque la souris quitte, on arrête l'animation après un délai
    if (imageRef.current && initialAnimationPlayed) {
      const img = imageRef.current;
      setTimeout(() => {
        if (img && !isHovering) {
          const currentSrc = img.src;
          img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
          img.src = currentSrc;
        }
      }, 3000); // Délai pour laisser l'animation se terminer
    }
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
      onError={(e) => {
        console.error("Erreur de chargement d'image");
        setImageLoaded(false);
      }}
    />
  );
};
