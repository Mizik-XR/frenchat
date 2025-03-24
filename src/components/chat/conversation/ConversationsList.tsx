
import React from '@/core/reactInstance';
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationListItem } from "./ConversationListItem";

interface ConversationsListProps {
  conversations: any[];
  currentConversation: any;
  searchQuery: string;
  onSelectConversation: (id: string) => void;
  onRenameClick: (event: React.MouseEvent, conversation: any) => void;
  onDeleteClick: (event: React.MouseEvent, id: string) => void;
}

export function ConversationsList({
  conversations,
  currentConversation,
  searchQuery,
  onSelectConversation,
  onRenameClick,
  onDeleteClick,
}: ConversationsListProps) {
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <ScrollArea className="flex-1">
      <div className="px-2">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isActive={currentConversation?.id === conversation.id}
              onSelect={onSelectConversation}
              onRenameClick={onRenameClick}
              onDeleteClick={onDeleteClick}
            />
          ))
        ) : (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Aucune conversation
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
