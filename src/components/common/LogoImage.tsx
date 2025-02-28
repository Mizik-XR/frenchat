
import React, { useState, useEffect } from 'react';

interface LogoImageProps {
  className?: string;
}

export const LogoImage = ({ className = "h-10 w-10" }: LogoImageProps) => {
  const [imagePath, setImagePath] = useState<string>("/filechat-animation.gif");
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    // Essayer plusieurs chemins possibles
    const paths = [
      "/filechat-animation.gif",
      "./filechat-animation.gif", 
      "filechat-animation.gif",
      "/public/filechat-animation.gif",
      "./public/filechat-animation.gif"
    ];
    
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
      for (const path of paths) {
        const success = await testImage(path);
        if (success) {
          setImagePath(path);
          setImageLoaded(true);
          return;
        }
      }
      console.error("Impossible de charger l'image depuis aucun chemin");
    };

    findWorkingPath();
  }, []);

  // Utiliser une icône de secours si l'image ne charge pas
  if (!imageLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-full ${className}`}>
        <span className="text-blue-500 font-bold">FC</span>
      </div>
    );
  }

  return (
    <img
      src={imagePath}
      alt="FileChat Logo"
      className={className}
      onError={(e) => {
        console.error("Erreur de chargement d'image");
        setImageLoaded(false);
      }}
    />
  );
};
