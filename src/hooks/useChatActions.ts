
import { useState  } from '@/core/reactInstance';
import { useMutation } from '@tanstack/react-query';
import { useConversations } from '@/hooks/useConversations';
import { useChatProcessing } from '@/hooks/chat/useChatProcessing';
import { WebUIConfig } from '@/types/chat';
import { toast } from '@/hooks/use-toast';

export const useChatActions = () => {
  const { sendMessage } = useChatProcessing();
  const { activeConversation, setActiveConversation, updateConversation } = useConversations();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSendMessage = async (
    content: string,
    conversationId: string,
    files: File[] = [],
    fileUrls: string[] = [],
    replyTo: { id: string; content: string; role: 'user' | 'assistant' } | null = null,
    config: WebUIConfig
  ) => {
    if (!content.trim() && files.length === 0 && fileUrls.length === 0) {
      toast({
        title: 'Message vide',
        description: 'Veuillez saisir un message ou joindre un fichier.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Mise à jour du titre si c'est le premier message
      if (activeConversation && activeConversation.title === 'Nouvelle conversation') {
        const title = content.length > 30 ? content.substring(0, 27) + '...' : content;
        
        updateConversation({
          id: conversationId,
          title: title
        });
        
        if (activeConversation) {
          setActiveConversation({
            ...activeConversation,
            title,
          });
        }
      }

      // Envoi du message avec gestion de la configuration et des pièces jointes
      await sendMessage({
        content,
        conversationId,
        files,
        fileUrls,
        replyTo: replyTo || undefined,
        config: {
          ...config,
          useMemory: config.useMemory || false
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'envoi du message.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleSendMessage,
    isProcessing,
  };
};
