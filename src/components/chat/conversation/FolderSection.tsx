
import { ChevronDown, ChevronRight, Folder, X } from "lucide-react";
import { ConversationFolder, Conversation } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ConversationGroup } from "./ConversationGroup";

interface FolderSectionProps {
  folder: ConversationFolder;
  isExpanded: boolean;
  toggleFolder: (folderId: string) => void;
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onUpdateConversation: (params: { id: string; title?: string; folderId?: string | null; isPinned?: boolean; isArchived?: boolean }) => void;
  onExportToDoc?: (id: string) => void;
  onDelete?: (id: string) => void;
  searchQuery: string;
  handleFolderDelete: (folderId: string) => void;
}

export const FolderSection = ({
  folder,
  isExpanded,
  toggleFolder,
  conversations,
  selectedId,
  onSelect,
  onUpdateConversation,
  onExportToDoc,
  onDelete,
  searchQuery,
  handleFolderDelete
}: FolderSectionProps) => {
  const folderConversations = conversations.filter(conv => conv.folderId === folder.id);
  
  // If there are no matching conversations in search mode, don't show the folder
  if (folderConversations.length === 0 && searchQuery) return null;

  const renderCollapsibleIcon = (isOpen: boolean) => {
    return isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />;
  };

  return (
    <Collapsible 
      open={isExpanded}
      className="mb-6"
    >
      <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
        <CollapsibleTrigger 
          className="flex items-center gap-2 hover:text-gray-700"
          onClick={() => toggleFolder(folder.id)}
        >
          {renderCollapsibleIcon(isExpanded)}
          <Folder className="h-4 w-4" />
          {folder.name} ({folderConversations.length})
        </CollapsibleTrigger>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
          onClick={() => handleFolderDelete(folder.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <CollapsibleContent>
        <ConversationGroup
          conversations={folderConversations}
          selectedId={selectedId}
          onSelect={onSelect}
          onUpdateConversation={onUpdateConversation}
          onExportToDoc={onExportToDoc}
          onDelete={onDelete}
          folderId={folder.id}
        />
      </CollapsibleContent>
    </Collapsible>
  );
};
