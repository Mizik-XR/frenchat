
import { useChatProcessing } from "./chat/useChatProcessing";

export function useChatLogic(selectedConversationId: string | null) {
  const {
    isLoading,
    replyToMessage,
    processMessage,
    handleReplyToMessage,
    clearReplyToMessage,
    serviceType,
    localAIUrl
  } = useChatProcessing(selectedConversationId);

  return {
    isLoading,
    replyToMessage,
    processMessage,
    handleReplyToMessage,
    clearReplyToMessage,
    serviceType,
    localAIUrl
  };
}
