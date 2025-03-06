
import React from "react";
import { Button } from "@/components/ui/button";
import { X, CornerDownRight } from "lucide-react";
import { Message } from "@/types/chat";

interface ReplyBadgeProps {
  replyToMessage: Message;
  onClearReply: () => void;
}

export const ReplyBadge = ({ replyToMessage, onClearReply }: ReplyBadgeProps) => {
  // Vérifier si le contenu du message est disponible pour éviter les erreurs
  const messageContent = replyToMessage?.content || "Message non disponible";
  
  return (
    <div className="flex items-center mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded border-l-2 border-blue-500 dark:border-blue-400">
      <div className="flex items-start gap-1.5 flex-1 overflow-hidden">
        <CornerDownRight className="h-3.5 w-3.5 text-blue-500 dark:text-blue-400 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
            En réponse à:
          </div>
          <div className="text-sm truncate max-w-full pr-2">
            {messageContent}
          </div>
        </div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={onClearReply}
        className="h-6 w-6 shrink-0"
        aria-label="Annuler la réponse"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Annuler la réponse</span>
      </Button>
    </div>
  );
};
