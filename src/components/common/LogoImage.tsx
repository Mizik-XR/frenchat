
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

  // Fonction pour arrêter l'animation du GIF
  const stopAnimation = () => {
    if (imageRef.current && imageRef.current.src) {
      const img = imageRef.current;
      const currentSrc = img.src;
      
      // Technique pour arrêter l'animation: remplacer par une image vide puis remettre la source
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
      setTimeout(() => {
        img.src = currentSrc;
      }, 50);
      
      setInitialAnimationPlayed(true);
    }
  };

  // Gérer l'animation initiale une seule fois
  useEffect(() => {
    if (imageLoaded && imageRef.current && !initialAnimationPlayed) {
      console.log("Animation initiale en cours...");
      
      // Arrêter l'animation après un délai
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      
      animationTimeoutRef.current = window.setTimeout(() => {
        if (!isHovering) {
          console.log("Arrêt de l'animation initiale");
          stopAnimation();
        }
      }, 3000); // Durée de l'animation en ms
    }
    
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [imageLoaded, initialAnimationPlayed, isHovering]);

  // Gestion du hover pour rejouer l'animation
  const handleMouseEnter = () => {
    console.log("Curseur sur l'image");
    setIsHovering(true);
    
    if (imageRef.current) {
      // Recharger l'image pour relancer l'animation
      const img = imageRef.current;
      const currentSrc = img.src;
      img.src = currentSrc + '?reload=' + new Date().getTime();
    }
    
    // Annuler tout timeout d'arrêt en cours
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    console.log("Curseur hors de l'image");
    setIsHovering(false);
    
    // Programmer l'arrêt de l'animation après le départ du curseur
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    animationTimeoutRef.current = window.setTimeout(() => {
      if (!isHovering) {
        console.log("Arrêt de l'animation après hover");
        stopAnimation();
      }
    }, 3000); // Délai pour laisser l'animation se terminer
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
