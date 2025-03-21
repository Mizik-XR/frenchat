import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, APP_STATE } from '@/integrations/supabase/client';
import { useChatMessages } from './useChatMessages';
import { useConversations } from './useConversations';
import { useSupabaseUser } from './useSupabaseUser';
import { adaptConversation, Conversation } from '@/integrations/supabase/adapters';

export function useChatLogic() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useSupabaseUser();
  const { messages, isLoading: messagesLoading, sendMessage, isGenerating } = useChatMessages(conversationId);
  const { conversations, isLoading: conversationsLoading, currentConversation, updateConversationTitle } = useConversations();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(APP_STATE.isOfflineMode);

  useEffect(() => {
    if (!user) {
      console.warn("L'utilisateur n'est pas encore chargé.");
      return;
    }

    if (!conversationId) {
      // Si aucun ID de conversation n'est fourni, rediriger vers la première conversation ou en créer une nouvelle
      if (conversations && conversations.length > 0) {
        navigate(`/chat/${conversations[0].id}`, { replace: true });
      } else {
        // Créer une nouvelle conversation et rediriger
        const createAndNavigate = async () => {
          const newConversation = await createConversation();
          if (newConversation) {
            navigate(`/chat/${newConversation.id}`, { replace: true });
          }
        };
        createAndNavigate();
      }
      return;
    }

    // Vérifier si la conversation actuelle correspond à l'ID
    if (currentConversation && currentConversation.id !== conversationId) {
      console.log("ID de conversation actuel:", currentConversation.id, "ID de conversation dans l'URL:", conversationId);
    }

    setIsInitialized(true);
  }, [user, conversationId, conversations, navigate, currentConversation]);

  useEffect(() => {
    setIsOfflineMode(APP_STATE.isOfflineMode);
    const handleOfflineChange = () => {
      setIsOfflineMode(APP_STATE.isOfflineMode);
    };

    window.addEventListener('storage', (e) => {
      if (e.key === 'OFFLINE_MODE') {
        handleOfflineChange();
      }
    });

    return () => {
      window.removeEventListener('storage', handleOfflineChange);
    };
  }, []);

  const createConversation = async () => {
    try {
      const userId = user?.id;
      if (!userId) {
        console.error("Utilisateur non authentifié.");
        return null;
      }

      const { data: newConversation, error } = await supabase
        .from('chat_conversations')
        .insert([{ user_id: userId, title: 'Nouvelle conversation' }])
        .single();

      if (error) {
        console.error("Erreur lors de la création de la conversation:", error);
        return null;
      }

      return newConversation;
    } catch (error) {
      console.error("Erreur lors de la création de la conversation:", error);
      return null;
    }
  };

  return {
    messages,
    sendMessage,
    isLoading: messagesLoading || conversationsLoading,
    conversations,
    currentConversation,
    updateConversationTitle,
    isOfflineMode,
    isGenerating
  };
}
