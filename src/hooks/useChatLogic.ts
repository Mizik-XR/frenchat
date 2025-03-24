
import { useChatProcessing } from "./chat/useChatProcessing";
import { APP_STATE } from "@/integrations/supabase/client";
import { useMemo, useState  } from '@/core/reactInstance';

export function useChatLogic() {
  const {
    isProcessing,
    isError,
    error
  } = useChatProcessing();
  
  const [replyToMessage, setReplyToMessage] = useState<{ id: string; content: string; role: 'user' | 'assistant' } | null>(null);
  const [serviceType, setServiceType] = useState<'local' | 'cloud' | 'hybrid'>('cloud');
  const [localAIUrl, setLocalAIUrl] = useState<string | null>(null);

  // Function to handle reply to message
  const handleReplyToMessage = (messageId: string, content: string, role: 'user' | 'assistant') => {
    setReplyToMessage({ id: messageId, content, role });
  };

  // Function to clear reply to message
  const clearReplyToMessage = () => {
    setReplyToMessage(null);
  };

  // Détecter si nous sommes en mode hors ligne
  const isOfflineMode = useMemo(() => APP_STATE.isOfflineMode, []);

  // Message d'information si on est en mode hors ligne
  const offlineInfo = useMemo(() => {
    if (isOfflineMode) {
      return {
        title: "Mode hors ligne",
        description: "L'application est en mode hors ligne en raison de problèmes de connexion. Certaines fonctionnalités peuvent être limitées."
      };
    }
    return null;
  }, [isOfflineMode]);

  // Vérifier s'il y a des problèmes de configuration
  const configIssues = useMemo(() => {
    const issues = [];
    
    if (serviceType === 'local' && !localAIUrl) {
      issues.push("Serveur IA local configuré mais non accessible");
    }
    
    if (APP_STATE.hasSupabaseError) {
      issues.push("Problèmes de connexion à la base de données");
    }
    
    return issues.length > 0 ? issues : null;
  }, [serviceType, localAIUrl]);

  return {
    isLoading: isProcessing,
    replyToMessage,
    processMessage: (content: string) => console.log("Processing message:", content),
    handleReplyToMessage,
    clearReplyToMessage,
    serviceType,
    localAIUrl,
    isOfflineMode,
    offlineInfo,
    configIssues
  };
}
