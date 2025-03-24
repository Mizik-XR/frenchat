
import { useState, useEffect  } from '@/core/reactInstance';
import { Archive } from "lucide-react";
import { Conversation } from "@/types/chat";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useConversationFolders } from "@/hooks/useConversationFolders";
import { NewFolderDialog } from "./conversation/NewFolderDialog";
import { NewConversationButton } from "./conversation/NewConversationButton";
import { SearchInput } from "./conversation/SearchInput";
import { PinnedConversationsSection } from "./conversation/PinnedConversationsSection";
import { FolderSection } from "./conversation/FolderSection";
import { UncategorizedConversationsSection } from "./conversation/UncategorizedConversationsSection";
import { ArchivedConversationsSection } from "./conversation/ArchivedConversationsSection";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onUpdateConversation: (params: { id: string; title?: string; folderId?: string | null; isPinned?: boolean; isArchived?: boolean }) => void;
  onExportToDoc?: (id: string) => void;
  onDelete?: (id: string) => void;
  selectedConversationId?: string;
}

export const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  onNew,
  onUpdateConversation,
  onExportToDoc,
  onDelete
}: ConversationListProps) => {
  const { folders, createFolder, deleteFolder } = useConversationFolders();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialState: Record<string, boolean> = {};
    folders.forEach(folder => {
      initialState[folder.id] = true;
    });
    setExpandedFolders(initialState);
  }, [folders]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder="Rechercher une conversation..."]')?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const activeConversations = conversations.filter(conv => !conv.isArchived);
  const archivedConversations = conversations.filter(conv => conv.isArchived);
  const pinnedConversations = activeConversations.filter(conv => conv.isPinned);
  const unpinnedConversations = activeConversations.filter(conv => !conv.isPinned);

  const filteredConversations = (convs: Conversation[]) => {
    if (!searchQuery.trim()) return convs;
    
    return convs.filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleFolderDelete = (folderId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce dossier ? Les conversations seront déplacées vers 'Non classées'.")) {
      deleteFolder(folderId);
    }
  };

  return (
    <div className="w-80 h-full border-r border-gray-200 bg-white/90 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="space-y-4">
          <NewConversationButton onClick={onNew} />
          <SearchInput 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-gray-100 bg-transparent p-0">
          <TabsTrigger 
            value="active" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <span className="flex items-center gap-2">
              Actives
              <Badge variant="outline" className="ml-1 bg-gray-100">
                {activeConversations.length}
              </Badge>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="archived"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <span className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archives
              <Badge variant="outline" className="ml-1 bg-gray-100">
                {archivedConversations.length}
              </Badge>
            </span>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="active" className="m-0 p-4">
            <PinnedConversationsSection 
              conversations={filteredConversations(pinnedConversations)}
              selectedId={selectedId}
              onSelect={onSelect}
              onUpdateConversation={onUpdateConversation}
              onExportToDoc={onExportToDoc}
              onDelete={onDelete}
            />

            {folders.map((folder) => (
              <FolderSection
                key={folder.id}
                folder={folder}
                isExpanded={expandedFolders[folder.id]}
                toggleFolder={toggleFolder}
                conversations={filteredConversations(unpinnedConversations)}
                selectedId={selectedId}
                onSelect={onSelect}
                onUpdateConversation={onUpdateConversation}
                onExportToDoc={onExportToDoc}
                onDelete={onDelete}
                searchQuery={searchQuery}
                handleFolderDelete={handleFolderDelete}
              />
            ))}

            <UncategorizedConversationsSection 
              conversations={filteredConversations(
                unpinnedConversations.filter(conv => !conv.folderId)
              )}
              selectedId={selectedId}
              onSelect={onSelect}
              onUpdateConversation={onUpdateConversation}
              onExportToDoc={onExportToDoc}
              onDelete={onDelete}
            />

            <NewFolderDialog onCreateFolder={createFolder} />
          </TabsContent>

          <TabsContent value="archived" className="m-0 p-4">
            <ArchivedConversationsSection 
              conversations={filteredConversations(archivedConversations)}
              selectedId={selectedId}
              onSelect={onSelect}
              onUpdateConversation={onUpdateConversation}
              onExportToDoc={onExportToDoc}
              onDelete={onDelete}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
