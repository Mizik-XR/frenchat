
import { Conversation } from "@/types/chat";
import { formatConversationDate } from "./utils/conversationItemActions";
import { ConversationItemMenu } from "./ConversationItemMenu";

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
  const formattedDate = formatConversationDate(conversation.createdAt);

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
            {formattedDate}
          </p>
        </div>

        <ConversationItemMenu
          conversation={conversation}
          onUpdateConversation={onUpdateConversation}
          onExportToDoc={onExportToDoc}
          onDelete={onDelete}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};
