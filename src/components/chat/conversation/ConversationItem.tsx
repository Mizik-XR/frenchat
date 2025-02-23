
import { useState } from "react";
import { Conversation } from "@/types/chat";
import { toast } from "@/hooks/use-toast";
import { ConversationButtons } from "./ConversationButtons";
import { ConversationTitle } from "./ConversationTitle";
import { useDragAndDrop } from "./useDragAndDrop";

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
  onExportToDoc?: () => void;
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
  onDelete,
  onExportToDoc,
  onEdit,
  onMoveToFolder,
  isArchived = false
}: ConversationItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const { isDragging, handleDragStart, handleDragEnd } = useDragAndDrop(conversation.id);

  const handleExportToDoc = async () => {
    try {
      if (onExportToDoc) {
        await onExportToDoc();
        toast({
          title: "Export réussi",
          description: "La conversation a été exportée vers Google Docs"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur d'export",
        description: "Impossible d'exporter la conversation vers Google Docs",
        variant: "destructive"
      });
    }
  };

  return (
    <div
      className={`group rounded-lg flex items-center gap-2 ${
        isSelected
          ? 'bg-blue-100 text-blue-900'
          : 'hover:bg-gray-100'
      } ${isDragging ? 'opacity-50' : ''}`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <ConversationTitle
        title={title}
        isEditing={isEditing}
        onClick={onClick}
        onTitleChange={setTitle}
        onBlur={() => {
          setIsEditing(false);
          if (title !== conversation.title && onEdit) {
            onEdit(title);
          }
        }}
      />
      
      <ConversationButtons
        conversation={conversation}
        isArchived={isArchived}
        onEdit={() => setIsEditing(true)}
        onPin={onPin}
        onArchive={onArchive}
        onRestore={onRestore}
        onDelete={onDelete}
        onExportToDoc={onExportToDoc}
        handleExportToDoc={handleExportToDoc}
      />
    </div>
  );
};
