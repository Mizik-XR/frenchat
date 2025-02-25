
import { useState } from "react";
import { Plus, Search, Archive, ChevronDown } from "lucide-react";
import { Conversation } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useConversationFolders } from "@/hooks/useConversationFolders";
import { ConversationGroup } from "./conversation/ConversationGroup";
import { NewFolderDialog } from "./conversation/NewFolderDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onUpdateConversation: (params: { id: string; title?: string; folderId?: string | null; isPinned?: boolean; isArchived?: boolean }) => void;
  onExportToDoc?: (id: string) => void;
  onDelete?: (id: string) => void;
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
  const { folders, createFolder } = useConversationFolders();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");

  const activeConversations = conversations.filter(conv => !conv.isArchived);
  const archivedConversations = conversations.filter(conv => conv.isArchived);
  const pinnedConversations = activeConversations.filter(conv => conv.isPinned);
  const unpinnedConversations = activeConversations.filter(conv => !conv.isPinned);

  const filteredConversations = (convs: Conversation[]) => {
    return convs.filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <div className="w-80 h-full border-r border-gray-200 bg-white/90 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="space-y-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onNew} 
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle conversation
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Démarrer une nouvelle conversation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                {activeConversations.length}
              </span>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="archived"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <span className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archives
              <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">
                {archivedConversations.length}
              </span>
            </span>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="active" className="m-0 p-4">
            {pinnedConversations.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <ChevronDown className="h-4 w-4" />
                  Épinglées
                </div>
                <ConversationGroup
                  conversations={filteredConversations(pinnedConversations)}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onUpdateConversation={onUpdateConversation}
                  onExportToDoc={onExportToDoc}
                  onDelete={onDelete}
                />
              </div>
            )}

            {folders.map((folder) => {
              const folderConversations = filteredConversations(
                unpinnedConversations.filter(conv => conv.folderId === folder.id)
              );

              if (folderConversations.length === 0) return null;

              return (
                <div key={folder.id} className="mb-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    <ChevronDown className="h-4 w-4" />
                    {folder.name}
                  </div>
                  <ConversationGroup
                    conversations={folderConversations}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onUpdateConversation={onUpdateConversation}
                    onExportToDoc={onExportToDoc}
                    onDelete={onDelete}
                    folderId={folder.id}
                  />
                </div>
              );
            })}

            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <ChevronDown className="h-4 w-4" />
                Non classées
              </div>
              <ConversationGroup
                conversations={filteredConversations(
                  unpinnedConversations.filter(conv => !conv.folderId)
                )}
                selectedId={selectedId}
                onSelect={onSelect}
                onUpdateConversation={onUpdateConversation}
                onExportToDoc={onExportToDoc}
                onDelete={onDelete}
                folderId={null}
              />
            </div>
          </TabsContent>

          <TabsContent value="archived" className="m-0 p-4">
            <ConversationGroup
              conversations={filteredConversations(archivedConversations)}
              selectedId={selectedId}
              onSelect={onSelect}
              onUpdateConversation={onUpdateConversation}
              onExportToDoc={onExportToDoc}
              onDelete={onDelete}
              isArchived={true}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
