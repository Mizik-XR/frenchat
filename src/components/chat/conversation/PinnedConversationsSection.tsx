
import { ChevronDown, ChevronRight } from "lucide-react";
import { Conversation } from "@/types/chat";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ConversationGroup } from "./ConversationGroup";

interface PinnedConversationsSectionProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onUpdateConversation: (params: { id: string; title?: string; folderId?: string | null; isPinned?: boolean; isArchived?: boolean }) => void;
  onExportToDoc?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const PinnedConversationsSection = ({
  conversations,
  selectedId,
  onSelect,
  onUpdateConversation,
  onExportToDoc,
  onDelete
}: PinnedConversationsSectionProps) => {
  if (conversations.length === 0) return null;

  return (
    <Collapsible defaultOpen className="mb-6">
      <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2 w-full hover:text-gray-700">
        <ChevronDown className="h-4 w-4" />
        Épinglées ({conversations.length})
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ConversationGroup
          conversations={conversations}
          selectedId={selectedId}
          onSelect={onSelect}
          onUpdateConversation={onUpdateConversation}
          onExportToDoc={onExportToDoc}
          onDelete={onDelete}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};
