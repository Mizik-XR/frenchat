
import { useState, useEffect, useCallback } from 'react';
import { isOllamaAvailable } from '@/utils/environment/localAIDetection';
import { isCloudModeForced } from '@/hooks/ai/environment/environmentDetection';

export type AIMode = 'cloud' | 'local' | 'hybrid';

export function useAIMode() {
  // Démarrer en mode cloud par défaut
  const [currentMode, setCurrentMode] = useState<AIMode>('cloud');
  const [isLocalAvailable, setIsLocalAvailable] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [userPreference, setUserPreference] = useState<AIMode | null>(null);
  
  // Vérification silencieuse de la disponibilité d'Ollama
  useEffect(() => {
    const checkLocalAvailability = async () => {
      // Ne pas tenter de détecter si le mode cloud est forcé
      if (isCloudModeForced()) {
        return;
      }
      
      // Vérifier si l'utilisateur a une préférence
      const savedPreference = localStorage.getItem('aiServiceType') as AIMode | null;
      if (savedPreference) {
        setUserPreference(savedPreference);
      }
      
      setIsDetecting(true);
      try {
        // Détection silencieuse d'Ollama
        const available = await isOllamaAvailable();
        setIsLocalAvailable(available);
        
        // Si Ollama est disponible et que l'utilisateur préfère le mode local, l'activer
        if (available && savedPreference === 'local') {
          setCurrentMode('local');
          console.log("[IA] Mode local activé selon les préférences utilisateur");
        }
      } catch (e) {
        // Gestion silencieuse des erreurs
        console.debug("[IA] Erreur lors de la détection d'Ollama:", e);
      } finally {
        setIsDetecting(false);
      }
    };
    
    // Exécution immédiate
    checkLocalAvailability();
    
    // Vérification périodique toutes les 5 minutes
    const interval = setInterval(checkLocalAvailability, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Fonction pour changer le mode manuellement
  const changeMode = useCallback((mode: AIMode) => {
    setCurrentMode(mode);
    localStorage.setItem('aiServiceType', mode);
    setUserPreference(mode);
    
    // Log discret pour le débogage
    console.log(`[IA] Mode changé manuellement vers: ${mode}`);
  }, []);
  
  return {
    currentMode,
    isLocalAvailable,
    isDetecting,
    changeMode,
    userPreference
  };
}
