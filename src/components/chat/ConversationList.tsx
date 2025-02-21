
import { useState } from "react";
import { MessageSquare, Plus, Folder, Pin, PinOff, Pencil } from "lucide-react";
import { Conversation, ConversationFolder } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  onUpdateConversation: (params: { id: string; title?: string; folderId?: string | null; isPinned?: boolean }) => void;
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
  const [editingConversation, setEditingConversation] = useState<{ id: string; title: string } | null>(null);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName("");
    }
  };

  const handleUpdateTitle = () => {
    if (editingConversation && editingConversation.title.trim()) {
      onUpdateConversation({ 
        id: editingConversation.id, 
        title: editingConversation.title.trim() 
      });
      setEditingConversation(null);
    }
  };

  const conversationsByFolder = conversations.reduce((acc, conv) => {
    const key = conv.folderId || 'none';
    if (!acc[key]) acc[key] = [];
    acc[key].push(conv);
    return acc;
  }, {} as Record<string, Conversation[]>);

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
      </div>

      <ScrollArea className="h-[calc(100vh-180px)] mt-4">
        <div className="space-y-4">
          {/* Conversations épinglées */}
          {conversations.filter(conv => conv.isPinned).length > 0 && (
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-2">Épinglées</h3>
              <div className="space-y-1">
                {conversations
                  .filter(conv => conv.isPinned)
                  .map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isSelected={selectedId === conv.id}
                      onClick={() => onSelect(conv.id)}
                      onPin={() => onUpdateConversation({ id: conv.id, isPinned: false })}
                      onEdit={(title) => onUpdateConversation({ id: conv.id, title })}
                      onMoveToFolder={(folderId) => onUpdateConversation({ id: conv.id, folderId })}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Conversations sans dossier */}
          {conversationsByFolder['none']?.length > 0 && (
            <div>
              <h3 className="font-medium text-sm text-gray-500 mb-2">Sans dossier</h3>
              <div className="space-y-1">
                {conversationsByFolder['none']
                  .filter(conv => !conv.isPinned)
                  .map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isSelected={selectedId === conv.id}
                      onClick={() => onSelect(conv.id)}
                      onPin={() => onUpdateConversation({ id: conv.id, isPinned: true })}
                      onEdit={(title) => onUpdateConversation({ id: conv.id, title })}
                      onMoveToFolder={(folderId) => onUpdateConversation({ id: conv.id, folderId })}
                    />
                  ))}
              </div>
            </div>
          )}

          {/* Dossiers et leurs conversations */}
          {folders.map((folder) => (
            <div key={folder.id}>
              <h3 className="font-medium text-sm text-gray-500 mb-2">{folder.name}</h3>
              <div className="space-y-1">
                {conversationsByFolder[folder.id]
                  ?.filter(conv => !conv.isPinned)
                  .map((conv) => (
                    <ConversationItem
                      key={conv.id}
                      conversation={conv}
                      isSelected={selectedId === conv.id}
                      onClick={() => onSelect(conv.id)}
                      onPin={() => onUpdateConversation({ id: conv.id, isPinned: true })}
                      onEdit={(title) => onUpdateConversation({ id: conv.id, title })}
                      onMoveToFolder={(folderId) => onUpdateConversation({ id: conv.id, folderId })}
                      currentFolderId={folder.id}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  onPin: () => void;
  onEdit: (title: string) => void;
  onMoveToFolder: (folderId: string | null) => void;
  currentFolderId?: string;
}

const ConversationItem = ({
  conversation,
  isSelected,
  onClick,
  onPin,
  onEdit,
  onMoveToFolder,
  currentFolderId
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
              if (title !== conversation.title) {
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
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onPin}
        >
          {conversation.isPinned ? (
            <PinOff className="h-4 w-4" />
          ) : (
            <Pin className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
