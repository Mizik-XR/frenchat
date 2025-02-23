
import { useState } from "react";
import { Plus } from "lucide-react";
import { Conversation } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useConversationFolders } from "@/hooks/useConversationFolders";
import { ConversationGroup } from "./conversation/ConversationGroup";
import { NewFolderDialog } from "./conversation/NewFolderDialog";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onUpdateConversation: (params: { id: string; title?: string; folderId?: string | null; isPinned?: boolean; isArchived?: boolean }) => void;
}

export const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  onNew,
  onUpdateConversation
}: ConversationListProps) => {
  const { folders, createFolder } = useConversationFolders();
  const [activeTab, setActiveTab] = useState("active");

  const activeConversations = conversations.filter(conv => !conv.isArchived);
  const archivedConversations = conversations.filter(conv => conv.isArchived);
  const pinnedConversations = activeConversations.filter(conv => conv.isPinned);
  const unpinnedConversations = activeConversations.filter(conv => !conv.isPinned);

  return (
    <div className="w-64 border-r border-gray-200 bg-white/80 p-4">
      <div className="space-y-4">
        <Button onClick={onNew} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle conversation
        </Button>

        <NewFolderDialog onCreateFolder={createFolder} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="active" className="flex-1">
              Actives ({activeConversations.length})
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex-1">
              Archives ({archivedConversations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-4">
                <ConversationGroup
                  title="Épinglées"
                  conversations={pinnedConversations}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onUpdateConversation={onUpdateConversation}
                />

                {folders.map((folder) => {
                  const folderConversations = unpinnedConversations.filter(
                    conv => conv.folderId === folder.id
                  );

                  return (
                    <ConversationGroup
                      key={folder.id}
                      title={folder.name}
                      conversations={folderConversations}
                      selectedId={selectedId}
                      onSelect={onSelect}
                      onUpdateConversation={onUpdateConversation}
                    />
                  );
                })}

                <ConversationGroup
                  title="Sans dossier"
                  conversations={unpinnedConversations.filter(conv => !conv.folderId)}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onUpdateConversation={onUpdateConversation}
                />
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="archived" className="mt-4">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <ConversationGroup
                title="Conversations archivées"
                conversations={archivedConversations}
                selectedId={selectedId}
                onSelect={onSelect}
                onUpdateConversation={onUpdateConversation}
                isArchived
              />
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
