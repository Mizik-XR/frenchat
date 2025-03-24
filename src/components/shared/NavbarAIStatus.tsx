
import { useState, useEffect  } from '@/core/reactInstance';
import { AIModeBadge } from "./AIModeBadge";
import { useSettings } from "@/contexts/SettingsContext";
import { isOllamaAvailable } from "@/utils/environment/localAIDetection";

export function NavbarAIStatus() {
  const { aiServiceType, isLocalAIAvailable } = useSettings();
  const [ollamaStatus, setOllamaStatus] = useState<boolean | null>(null);
  const [provider, setProvider] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    // Vérifier si Ollama est disponible
    const checkOllama = async () => {
      const available = await isOllamaAvailable();
      setOllamaStatus(available);
      
      // Définir le provider en fonction de l'état d'Ollama et du type de service
      if (aiServiceType === 'local' && available) {
        setProvider('ollama');
      } else if (aiServiceType === 'local') {
        setProvider('transformers');
      } else if (aiServiceType === 'cloud') {
        // Récupérer le provider cloud depuis le localStorage
        const cloudProvider = localStorage.getItem('cloudProvider') || 'huggingface';
        setProvider(cloudProvider);
      }
    };
    
    checkOllama();
    
    // Vérifier régulièrement l'état d'Ollama (toutes les 30 secondes)
    const interval = setInterval(checkOllama, 30000);
    
    return () => clearInterval(interval);
  }, [aiServiceType]);
  
  return (
    <div className="flex items-center">
      <AIModeBadge 
        mode={aiServiceType} 
        provider={provider}
        size="sm"
      />
    </div>
  );
}
