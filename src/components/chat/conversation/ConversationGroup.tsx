
import { Conversation } from "@/types/chat";
import { ConversationItem } from "./ConversationItem";

interface ConversationGroupProps {
  title: string;
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onUpdateConversation: (params: { id: string; title?: string; folderId?: string | null; isPinned?: boolean; isArchived?: boolean }) => void;
  isArchived?: boolean;
}

export const ConversationGroup = ({
  title,
  conversations,
  selectedId,
  onSelect,
  onUpdateConversation,
  isArchived = false
}: ConversationGroupProps) => {
  if (conversations.length === 0) return null;

  return (
    <div>
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
            onMoveToFolder={isArchived ? undefined : (folderId) => onUpdateConversation({ id: conv.id, folderId })}
            isArchived={isArchived}
          />
        ))}
      </div>
    </div>
  );
};
