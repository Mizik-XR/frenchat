
import { React, useState, useEffect, createSafeContext } from '@/core/ReactInstance';
import { isLocalAIAllowed } from '@/hooks/ai/environment/environmentDetection';

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

// Création du contexte avec l'API simplifiée
const { Context: SettingsContext, useContext: useSettings } = createSafeContext<SettingsContextType>(
  defaultSettings,
  "SettingsContext"
);

// Export direct du hook
export { useSettings };

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
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
