
import { Archive } from "lucide-react";
import { Conversation } from "@/types/chat";
import { ConversationGroup } from "./ConversationGroup";

interface ArchivedConversationsSectionProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onUpdateConversation: (params: { id: string; title?: string; folderId?: string | null; isPinned?: boolean; isArchived?: boolean }) => void;
  onExportToDoc?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ArchivedConversationsSection = ({
  conversations,
  selectedId,
  onSelect,
  onUpdateConversation,
  onExportToDoc,
  onDelete
}: ArchivedConversationsSectionProps) => {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Archive className="h-12 w-12 mx-auto mb-2 opacity-30" />
        <p>Aucune conversation archivée</p>
      </div>
    );
  }

  return (
    <ConversationGroup
      conversations={conversations}
      selectedId={selectedId}
      onSelect={onSelect}
      onUpdateConversation={onUpdateConversation}
      onExportToDoc={onExportToDoc}
      onDelete={onDelete}
      isArchived={true}
    />
  );
};
