import { React } from "@/core/ReactInstance";

import { useState } from "react";
import { Conversation } from "@/types/chat";
import { useGoogleDriveStatus } from "@/hooks/useGoogleDriveStatus";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Archive, Download, MoreVertical, Pin, PinOff, Trash2, FileText, FileUp } from "lucide-react";
import {
  handlePinConversation,
  handleArchiveConversation,
  handleExportDocument,
  handleExportToDrive,
  handleDeleteConversation,
} from "./utils/conversationItemActions";

interface ConversationItemMenuProps {
  conversation: Conversation;
  onUpdateConversation: (params: { id: string; isPinned?: boolean; isArchived?: boolean }) => void;
  onExportToDoc?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick: (e: React.MouseEvent) => void;
}

export const ConversationItemMenu = ({
  conversation,
  onUpdateConversation,
  onExportToDoc,
  onDelete,
  onClick,
}: ConversationItemMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { isConnected: isDriveConnected } = useGoogleDriveStatus();
  
  const handleExportToDriveClick = async () => {
    setIsExporting(true);
    const title = conversation.title || `Conversation du ${new Date(conversation.createdAt).toLocaleDateString('fr-FR')}`;
    await handleExportToDrive(isDriveConnected, conversation.id, title);
    setIsExporting(false);
  };

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild onClick={onClick}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={() => handlePinConversation(conversation, onUpdateConversation)}>
          {conversation.isPinned ? (
            <>
              <PinOff className="h-4 w-4 mr-2" />
              Désépingler
            </>
          ) : (
            <>
              <Pin className="h-4 w-4 mr-2" />
              Épingler
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => handleArchiveConversation(conversation, onUpdateConversation)}>
          <Archive className="h-4 w-4 mr-2" />
          {conversation.isArchived ? "Désarchiver" : "Archiver"}
        </DropdownMenuItem>

        {onExportToDoc && (
          <DropdownMenuItem onClick={() => handleExportDocument(onExportToDoc, conversation.id)}>
            <Download className="h-4 w-4 mr-2" />
            Exporter en document
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          onClick={handleExportToDriveClick}
          disabled={!isDriveConnected || isExporting}
        >
          <FileUp className="h-4 w-4 mr-2" />
          {isExporting ? "Export en cours..." : "Exporter vers Google Drive"}
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => {
          window.open(`https://docs.google.com/document/create`, '_blank');
        }}>
          <FileText className="h-4 w-4 mr-2" />
          Ouvrir dans Google Docs
        </DropdownMenuItem>

        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => handleDeleteConversation(onDelete, conversation.id)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
