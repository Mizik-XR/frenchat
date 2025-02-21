
import { MessageSquare, Plus } from "lucide-react";
import { Conversation } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  onNew
}: ConversationListProps) => {
  return (
    <div className="w-64 border-r border-gray-200 bg-white/80 p-4">
      <Button 
        onClick={onNew}
        className="w-full mb-4 gap-2"
      >
        <Plus className="h-4 w-4" />
        Nouvelle conversation
      </Button>

      <ScrollArea className="h-[calc(100vh-180px)]">
        <div className="space-y-2">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full p-3 text-left rounded-lg flex items-center gap-3 transition-colors ${
                selectedId === conv.id
                  ? 'bg-blue-100 text-blue-900'
                  : 'hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="h-5 w-5 shrink-0" />
              <div className="truncate flex-1">
                <div className="font-medium truncate">{conv.title}</div>
                <div className="text-xs text-gray-500">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
