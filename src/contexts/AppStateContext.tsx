
import { React, createContext, useContext, useState } from '@/core/ReactInstance';

interface AppStateContextType {
  isOfflineMode: boolean;
  toggleOfflineMode: (value?: boolean) => void;
  webUIConfig: {
    showSidebar: boolean;
    darkMode: boolean;
    compactView: boolean;
  };
  updateWebUIConfig: (config: Partial<AppStateContextType['webUIConfig']>) => void;
  logError?: (error: Error, context?: string) => void;
}

const defaultState: AppStateContextType = {
  isOfflineMode: false,
  toggleOfflineMode: () => {},
  webUIConfig: {
    showSidebar: true,
    darkMode: false,
    compactView: false,
  },
  updateWebUIConfig: () => {},
  logError: (error, context) => console.error(`[${context || 'App'}] Error:`, error)
};

const AppStateContext = createContext<AppStateContextType>(defaultState);

export const useAppState = () => useContext(AppStateContext);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [webUIConfig, setWebUIConfig] = useState(defaultState.webUIConfig);

  const toggleOfflineMode = (value?: boolean) => {
    const newValue = value !== undefined ? value : !isOfflineMode;
    setIsOfflineMode(newValue);
    localStorage.setItem('OFFLINE_MODE', String(newValue));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'OFFLINE_MODE',
      newValue: String(newValue)
    }));
  };

  const updateWebUIConfig = (config: Partial<AppStateContextType['webUIConfig']>) => {
    setWebUIConfig(prev => ({ ...prev, ...config }));
    localStorage.setItem('WEB_UI_CONFIG', JSON.stringify({ ...webUIConfig, ...config }));
  };

  const logError = (error: Error, context?: string) => {
    console.error(`[${context || 'App'}] Error:`, error);
    // Pourrait aussi envoyer l'erreur à un service de monitoring
  };

  return (
    <AppStateContext.Provider value={{
      isOfflineMode,
      toggleOfflineMode,
      webUIConfig,
      updateWebUIConfig,
      logError
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export default AppStateContext;
