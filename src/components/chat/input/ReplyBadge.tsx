
import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Message } from "@/types/chat";

interface ReplyBadgeProps {
  replyToMessage: Message;
  onClearReply: () => void;
}

export const ReplyBadge = ({ replyToMessage, onClearReply }: ReplyBadgeProps) => {
  return (
    <div className="flex items-center mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
      <div className="flex-1 overflow-hidden">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
          En réponse à:
        </div>
        <div className="text-sm truncate">{replyToMessage.content}</div>
      </div>
      <Button
        size="icon"
        variant="ghost"
        onClick={onClearReply}
        className="h-6 w-6"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Annuler la réponse</span>
      </Button>
    </div>
  );
};
