
import { useState } from "react";
import { MessageSquare, Plus, Folder, Pin, PinOff, Pencil, Archive, RefreshCw } from "lucide-react";
import { Conversation, ConversationFolder } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConversationFolders } from "@/hooks/useConversationFolders";

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
  const [newFolderName, setNewFolderName] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName("");
    }
  };

  const activeConversations = conversations.filter(conv => !conv.isArchived);
  const archivedConversations = conversations.filter(conv => conv.isArchived);

  return (
    <div className="w-64 border-r border-gray-200 bg-white/80 p-4">
      <div className="space-y-4">
        <Button 
          onClick={onNew}
          className="w-full gap-2"
        >
          <Plus className="h-4 w-4" />
          Nouvelle conversation
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <Folder className="h-4 w-4" />
              Nouveau dossier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau dossier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du dossier</Label>
                <Input
                  id="name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Mon dossier"
                />
              </div>
              <Button onClick={handleCreateFolder} className="w-full">
                Créer
              </Button>
            </div>
          </DialogContent>
        </Dialog>

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
                {/* Conversations épinglées */}
                {activeConversations.filter(conv => conv.isPinned).length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Épinglées</h3>
                    <div className="space-y-1">
                      {activeConversations
                        .filter(conv => conv.isPinned)
                        .map((conv) => (
                          <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isSelected={selectedId === conv.id}
                            onClick={() => onSelect(conv.id)}
                            onPin={() => onUpdateConversation({ id: conv.id, isPinned: false })}
                            onArchive={() => onUpdateConversation({ id: conv.id, isArchived: true })}
                            onEdit={(title) => onUpdateConversation({ id: conv.id, title })}
                            onMoveToFolder={(folderId) => onUpdateConversation({ id: conv.id, folderId })}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Conversations non archivées par dossier */}
                {folders.map((folder) => {
                  const folderConversations = activeConversations.filter(
                    conv => !conv.isPinned && conv.folderId === folder.id
                  );
                  if (folderConversations.length === 0) return null;

                  return (
                    <div key={folder.id}>
                      <h3 className="font-medium text-sm text-gray-500 mb-2">{folder.name}</h3>
                      <div className="space-y-1">
                        {folderConversations.map((conv) => (
                          <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isSelected={selectedId === conv.id}
                            onClick={() => onSelect(conv.id)}
                            onPin={() => onUpdateConversation({ id: conv.id, isPinned: true })}
                            onArchive={() => onUpdateConversation({ id: conv.id, isArchived: true })}
                            onEdit={(title) => onUpdateConversation({ id: conv.id, title })}
                            onMoveToFolder={(folderId) => onUpdateConversation({ id: conv.id, folderId })}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}

                {/* Conversations sans dossier */}
                {activeConversations.filter(conv => !conv.isPinned && !conv.folderId).length > 0 && (
                  <div>
                    <h3 className="font-medium text-sm text-gray-500 mb-2">Sans dossier</h3>
                    <div className="space-y-1">
                      {activeConversations
                        .filter(conv => !conv.isPinned && !conv.folderId)
                        .map((conv) => (
                          <ConversationItem
                            key={conv.id}
                            conversation={conv}
                            isSelected={selectedId === conv.id}
                            onClick={() => onSelect(conv.id)}
                            onPin={() => onUpdateConversation({ id: conv.id, isPinned: true })}
                            onArchive={() => onUpdateConversation({ id: conv.id, isArchived: true })}
                            onEdit={(title) => onUpdateConversation({ id: conv.id, title })}
                            onMoveToFolder={(folderId) => onUpdateConversation({ id: conv.id, folderId })}
                          />
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="archived" className="mt-4">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-4">
                {archivedConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isSelected={selectedId === conv.id}
                    onClick={() => onSelect(conv.id)}
                    onRestore={() => onUpdateConversation({ id: conv.id, isArchived: false })}
                    onEdit={(title) => onUpdateConversation({ id: conv.id, title })}
                    isArchived
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onPin?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onEdit?: (title: string) => void;
  onMoveToFolder?: (folderId: string | null) => void;
  isArchived?: boolean;
}

const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
  onPin,
  onArchive,
  onRestore,
  onEdit,
  onMoveToFolder,
  isArchived = false
}: ConversationItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(conversation.title);
  const { folders } = useConversationFolders();

  return (
    <div
      className={`group rounded-lg flex items-center gap-2 ${
        isSelected
          ? 'bg-blue-100 text-blue-900'
          : 'hover:bg-gray-100'
      }`}
    >
      <button
        onClick={onClick}
        className="flex-1 p-2 text-left flex items-center gap-2"
      >
        <MessageSquare className="h-4 w-4 shrink-0" />
        {isEditing ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              setIsEditing(false);
              if (title !== conversation.title && onEdit) {
                onEdit(title);
              }
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <div className="truncate">{conversation.title}</div>
        )}
      </button>
      
      <div className="opacity-0 group-hover:opacity-100 flex items-center pr-2">
        {!isArchived && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsEditing(true)}
              title="Renommer"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            {onPin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onPin}
                title={conversation.isPinned ? "Désépingler" : "Épingler"}
              >
                {conversation.isPinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </Button>
            )}
            {onArchive && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={onArchive}
                title="Archiver"
              >
                <Archive className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
        {isArchived && onRestore && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onRestore}
            title="Restaurer"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
