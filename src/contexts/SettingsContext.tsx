
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SettingsContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  localAIUrl: string;
  setLocalAIUrl: (url: string) => void;
  aiServiceType: 'local' | 'cloud' | 'hybrid';
  setAiServiceType: (type: 'local' | 'cloud' | 'hybrid') => void;
}

const defaultSettings: SettingsContextType = {
  theme: 'system',
  setTheme: () => {},
  localAIUrl: 'http://localhost:11434',
  setLocalAIUrl: () => {},
  aiServiceType: 'local',
  setAiServiceType: () => {},
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
    (localStorage.getItem('aiServiceType') as 'local' | 'cloud' | 'hybrid') || 'local'
  );

  const updateTheme = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const updateLocalAIUrl = (url: string) => {
    setLocalAIUrl(url);
    localStorage.setItem('localAIUrl', url);
  };

  const updateAiServiceType = (type: 'local' | 'cloud' | 'hybrid') => {
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
