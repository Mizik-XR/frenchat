
import React, { useState, useEffect } from 'react';

interface LogoImageProps {
  className?: string;
  fallbackText?: string;
}

export const LogoImage = ({ 
  className = "h-10 w-10", 
  fallbackText = "FC" 
}: LogoImageProps) => {
  const [imagePath, setImagePath] = useState<string>("");
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [loadAttempted, setLoadAttempted] = useState<boolean>(false);
  
  useEffect(() => {
    console.log("LogoImage: Tentative de chargement de l'image");
    
    // Liste des chemins possibles pour trouver l'image
    const possiblePaths = [
      // Chemins relatifs à l'application
      "/filechat-animation.gif",
      "./filechat-animation.gif", 
      "filechat-animation.gif",
      // Chemins absolus basés sur l'origine
      `${window.location.origin}/filechat-animation.gif`,
      // Chemins pour les environnements de développement
      "/public/filechat-animation.gif",
      "./public/filechat-animation.gif",
      // Chemins pour les builds de production
      "/assets/filechat-animation.gif",
      "./assets/filechat-animation.gif",
      // Chemin Lovable
      './public/lovable-uploads/filechat-animation.gif'
    ];
    
    // Tester la charge de l'image avec chaque chemin
    const testImage = (path: string) => {
      return new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => {
          console.log(`LogoImage: Chemin fonctionnel trouvé: ${path}`);
          resolve(true);
        };
        img.onerror = () => {
          console.log(`LogoImage: Échec du chargement pour: ${path}`);
          resolve(false);
        };
        img.src = path;
      });
    };

    const findWorkingPath = async () => {
      setLoadAttempted(true);
      
      for (const path of possiblePaths) {
        const success = await testImage(path);
        if (success) {
          setImagePath(path);
          setImageLoaded(true);
          return;
        }
      }
      
      // Si nous sommes dans un environnement de déploiement
      if (window.location.hostname.includes('preview') || 
          window.location.hostname.includes('netlify') || 
          window.location.hostname.includes('vercel')) {
        // Essayer un chemin spécifique aux déploiements
        const deploymentPath = `${window.location.origin}/filechat-animation.gif`;
        const success = await testImage(deploymentPath);
        if (success) {
          setImagePath(deploymentPath);
          setImageLoaded(true);
          return;
        }
      }
      
      // Utiliser une image statique de secours si disponible
      const staticFallback = "/favicon.ico";
      const fallbackSuccess = await testImage(staticFallback);
      if (fallbackSuccess) {
        console.log("LogoImage: Utilisation de l'image de secours");
        setImagePath(staticFallback);
        setImageLoaded(true);
        return;
      }
      
      console.warn("LogoImage: Aucun chemin d'image fonctionnel trouvé");
    };

    findWorkingPath();
  }, []);

  // Utiliser une icône de secours si l'image ne charge pas
  if (!imageLoaded) {
    return (
      <div className={`flex items-center justify-center bg-purple-100 rounded-full ${className}`}>
        <span className="text-purple-600 font-bold">{fallbackText}</span>
      </div>
    );
  }

  return (
    <img
      src={imagePath}
      alt="Frenchat Logo"
      className={className}
      onError={(e) => {
        console.error("LogoImage: Erreur de chargement de l'image:", e);
        setImageLoaded(false);
      }}
    />
  );
};
