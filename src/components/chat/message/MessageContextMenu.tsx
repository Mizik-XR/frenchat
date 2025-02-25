
import React from 'react';
import { Message } from "@/types/chat";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MessageCircleMore,
  Reply,
  Copy,
  Share,
  Archive,
  Trash2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MessageContextMenuProps {
  message: Message;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onArchive: (messageId: string) => void;
}

export const MessageContextMenu = ({
  message,
  onReply,
  onDelete,
  onArchive
}: MessageContextMenuProps) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: "Message copié",
      description: "Le contenu du message a été copié dans le presse-papier"
    });
  };

  const handleShare = () => {
    // Pour l'instant, on simule juste le partage
    toast({
      title: "Partage",
      description: "Fonctionnalité de partage à venir"
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="invisible group-hover:visible p-1 rounded-full hover:bg-gray-100 transition-colors">
          <MessageCircleMore className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onReply(message)}>
          <Reply className="h-4 w-4 mr-2" />
          Répondre
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copier
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare}>
          <Share className="h-4 w-4 mr-2" />
          Partager
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onArchive(message.id)}>
          <Archive className="h-4 w-4 mr-2" />
          Archiver
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(message.id)}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
