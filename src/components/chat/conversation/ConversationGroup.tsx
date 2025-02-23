
import { Conversation } from "@/types/chat";
import { ConversationItem } from "./ConversationItem";

interface ConversationGroupProps {
  title: string;
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onUpdateConversation: (params: { id: string; title?: string; folderId?: string | null; isPinned?: boolean; isArchived?: boolean }) => void;
  onExportToDoc?: (id: string) => void;
  onDelete?: (id: string) => void;
  isArchived?: boolean;
  folderId?: string | null;
}

export const ConversationGroup = ({
  title,
  conversations,
  selectedId,
  onSelect,
  onUpdateConversation,
  onExportToDoc,
  onDelete,
  isArchived = false,
  folderId
}: ConversationGroupProps) => {
  if (conversations.length === 0) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');
    
    const conversationId = e.dataTransfer.getData('conversation_id');
    if (conversationId) {
      onUpdateConversation({ 
        id: conversationId, 
        folderId: folderId 
      });
    }
  };

  return (
    <div
      className="rounded-lg p-2 transition-colors"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <h3 className="font-medium text-sm text-gray-500 mb-2">{title}</h3>
      <div className="space-y-1">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isSelected={selectedId === conv.id}
            onClick={() => onSelect(conv.id)}
            onPin={isArchived ? undefined : () => onUpdateConversation({ id: conv.id, isPinned: !conv.isPinned })}
            onArchive={isArchived ? undefined : () => onUpdateConversation({ id: conv.id, isArchived: true })}
            onRestore={isArchived ? () => onUpdateConversation({ id: conv.id, isArchived: false }) : undefined}
            onEdit={(title) => onUpdateConversation({ id: conv.id, title })}
            onDelete={onDelete ? () => onDelete(conv.id) : undefined}
            onExportToDoc={onExportToDoc ? () => onExportToDoc(conv.id) : undefined}
            onMoveToFolder={isArchived ? undefined : (folderId) => onUpdateConversation({ id: conv.id, folderId })}
            isArchived={isArchived}
          />
        ))}
      </div>
    </div>
  );
};
