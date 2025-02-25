
import { Conversation } from "@/types/chat";
import { ConversationItem } from "./ConversationItem";

interface ConversationGroupProps {
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
      <div className="space-y-1">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isSelected={selectedId === conv.id}
            onSelect={() => onSelect(conv.id)}
            onUpdateConversation={onUpdateConversation}
            onExportToDoc={onExportToDoc}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
