
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Fonction pour vérifier si l'IA locale est autorisée
const isLocalAIAllowed = (): boolean => {
  // Vérifier si nous sommes dans un environnement sans serveur local
  if (window.location.hostname.includes('lovable') || 
      window.location.search.includes('forceCloud') ||
      localStorage.getItem('FORCE_CLOUD_MODE') === 'true') {
    return false;
  }
  return true;
};

interface SettingsContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  localAIUrl: string;
  setLocalAIUrl: (url: string) => void;
  aiServiceType: 'local' | 'cloud' | 'hybrid';
  setAiServiceType: (type: 'local' | 'cloud' | 'hybrid') => void;
  isLocalAIAvailable: boolean;
}

// Valeurs par défaut modifiées pour le mode cloud
const defaultSettings: SettingsContextType = {
  theme: 'system',
  setTheme: () => {},
  localAIUrl: 'http://localhost:11434',
  setLocalAIUrl: () => {},
  aiServiceType: 'cloud', // Changé à 'cloud' par défaut
  setAiServiceType: () => {},
  isLocalAIAvailable: true,
};

const SettingsContext = createContext<SettingsContextType>(defaultSettings);

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system'
  );
  const [localAIUrl, setLocalAIUrl] = useState<string>(
    localStorage.getItem('localAIUrl') || 'http://localhost:11434'
  );
  const [aiServiceType, setAiServiceType] = useState<'local' | 'cloud' | 'hybrid'>(
    (localStorage.getItem('aiServiceType') as 'local' | 'cloud' | 'hybrid') || 'cloud' // Changé à 'cloud' par défaut
  );
  const [isLocalAIAvailable, setIsLocalAIAvailable] = useState<boolean>(isLocalAIAllowed());

  // Vérifier si l'IA locale est disponible au chargement
  useEffect(() => {
    const checkLocalAIAvailability = () => {
      setIsLocalAIAvailable(isLocalAIAllowed());
      
      // Si l'IA locale n'est pas disponible et que l'utilisateur a sélectionné 'local',
      // basculer automatiquement vers 'cloud' mais silencieusement
      if (!isLocalAIAllowed() && aiServiceType === 'local') {
        updateAiServiceType('cloud');
        console.debug("[IA] Basculement silencieux vers le mode cloud, IA locale non disponible");
      }
    };
    
    checkLocalAIAvailability();
    
    // Vérifier également au changement d'URL (pour les paramètres d'URL)
    window.addEventListener('popstate', checkLocalAIAvailability);
    return () => window.removeEventListener('popstate', checkLocalAIAvailability);
  }, []);

  const updateTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const updateLocalAIUrl = (url: string) => {
    setLocalAIUrl(url);
    localStorage.setItem('localAIUrl', url);
  };

  const updateAiServiceType = (type: 'local' | 'cloud' | 'hybrid') => {
    // Si l'IA locale n'est pas disponible, on ne peut pas basculer en mode local
    if (type === 'local' && !isLocalAIAvailable) {
      console.debug("[IA] L'IA locale n'est pas disponible, mode local non activé");
      return;
    }
    
    setAiServiceType(type);
    localStorage.setItem('aiServiceType', type);
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme: updateTheme,
        localAIUrl,
        setLocalAIUrl: updateLocalAIUrl,
        aiServiceType,
        setAiServiceType: updateAiServiceType,
        isLocalAIAvailable,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
