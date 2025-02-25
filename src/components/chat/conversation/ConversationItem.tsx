
import { useState } from "react";
import { Conversation } from "@/types/chat";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Archive, Download, MoreVertical, Pin, PinOff, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateConversation: (params: { id: string; isPinned?: boolean; isArchived?: boolean }) => void;
  onExportToDoc?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ConversationItem = ({
  conversation,
  isSelected,
  onSelect,
  onUpdateConversation,
  onExportToDoc,
  onDelete
}: ConversationItemProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePin = () => {
    onUpdateConversation({ id: conversation.id, isPinned: !conversation.isPinned });
    toast({
      title: conversation.isPinned ? "Conversation désépinglée" : "Conversation épinglée",
      description: conversation.isPinned ? 
        "La conversation n'apparaîtra plus en haut de la liste" : 
        "La conversation apparaîtra en haut de la liste"
    });
  };

  const handleArchive = () => {
    onUpdateConversation({ id: conversation.id, isArchived: !conversation.isArchived });
    toast({
      title: conversation.isArchived ? "Conversation désarchivée" : "Conversation archivée",
      description: conversation.isArchived ?
        "La conversation est de nouveau active" :
        "La conversation a été déplacée dans les archives"
    });
  };

  const handleExport = () => {
    if (onExportToDoc) {
      onExportToDoc(conversation.id);
      toast({
        title: "Export en cours",
        description: "Le document est en cours de génération..."
      });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(conversation.id);
      toast({
        title: "Conversation supprimée",
        description: "La conversation a été définitivement supprimée",
        variant: "destructive"
      });
    }
  };

  return (
    <div 
      className={`
        group relative rounded-lg p-3 cursor-pointer transition-all
        hover:bg-accent/50
        ${isSelected ? 'bg-accent text-accent-foreground' : 'hover:text-accent-foreground'}
        ${conversation.isPinned ? 'border-l-4 border-primary' : ''}
      `}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{conversation.title}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {new Date(conversation.created_at).toLocaleDateString()}
          </p>
        </div>

        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handlePin}>
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
            
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="h-4 w-4 mr-2" />
              {conversation.isArchived ? "Désarchiver" : "Archiver"}
            </DropdownMenuItem>

            {onExportToDoc && (
              <DropdownMenuItem onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </DropdownMenuItem>
            )}

            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
