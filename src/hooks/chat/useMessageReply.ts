
import { useState, useEffect  } from '@/core/reactInstance';
import { toast } from "@/hooks/use-toast";
import { Message } from "@/types/chat";

export function useMessageReply() {
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);

  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message);
    toast({
      title: "Réponse",
      description: "Vous répondez à un message spécifique",
    });
  };

  const clearReplyToMessage = () => setReplyToMessage(null);

  const buildReplyPrompt = (originalMessage: string, replyMessage: Message | null) => {
    if (!replyMessage) return originalMessage;
    
    return `Tu réponds au message suivant: "${replyMessage.content}"\n\nLa nouvelle question/commentaire est: "${originalMessage}"`;
  };

  return {
    replyToMessage,
    handleReplyToMessage,
    clearReplyToMessage,
    buildReplyPrompt
  };
}
