
import { useState } from "react";
import { MessageSquare, Pin, PinOff, Pencil, Archive, RefreshCw } from "lucide-react";
import { Conversation } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConversationFolders } from "@/hooks/useConversationFolders";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onEdit?: (title: string) => void;
  onMoveToFolder?: (folderId: string | null) => void;
  isArchived?: boolean;
}

export const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
  onPin,
  onArchive,
  onRestore,
  onEdit,
  onMoveToFolder,
  isArchived = false
}: ConversationItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);

  return (
    <div
      className={`group rounded-lg flex items-center gap-2 ${
        isSelected
          ? 'bg-blue-100 text-blue-900'
          : 'hover:bg-gray-100'
      }`}
    >
      <button
        onClick={onClick}
        className="flex-1 p-2 text-left flex items-center gap-2"
      >
        <MessageSquare className="h-4 w-4 shrink-0" />
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              if (title !== conversation.title && onEdit) {
                onEdit(title);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <div className="truncate">{conversation.title}</div>
        )}
      </button>
      
      <div className="opacity-0 group-hover:opacity-100 flex items-center pr-2">
        {!isArchived && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsEditing(true)}
              title="Renommer"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {onPin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onPin}
                title={conversation.isPinned ? "Désépingler" : "Épingler"}
              >
                {conversation.isPinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </Button>
            )}
            {onArchive && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onArchive}
                title="Archiver"
              >
                <Archive className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
        {isArchived && onRestore && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onRestore}
            title="Restaurer"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
