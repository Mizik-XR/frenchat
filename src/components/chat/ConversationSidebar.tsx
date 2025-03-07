
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { ConversationsList } from "./conversation/ConversationsList";
import { RenameDialog } from "./conversation/RenameDialog";
import { DeleteDialog } from "./conversation/DeleteDialog";

interface SidebarProps {
  conversations: any[];
  currentConversation: any;
  onSelectConversation: (id: string) => void;
  onCreateNewConversation: () => Promise<void>;
  onRenameConversation: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => void;
}

export function Sidebar({
  conversations,
  currentConversation,
  onSelectConversation,
  onCreateNewConversation,
  onRenameConversation,
  onDeleteConversation,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToRename, setConversationToRename] = useState<any>(null);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleRenameClick = (event: React.MouseEvent, conversation: any) => {
    event.stopPropagation();
    setConversationToRename(conversation);
    setNewTitle(conversation.title);
    setRenameDialogOpen(true);
  };

  const handleDeleteClick = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    setConversationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleRenameSave = () => {
    if (conversationToRename && newTitle.trim() !== "") {
      onRenameConversation(conversationToRename.id, newTitle);
      setRenameDialogOpen(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="w-80 min-w-80 border-r border-border flex flex-col bg-background h-full">
      <div className="p-4 flex flex-col space-y-4">
        <Button 
          onClick={onCreateNewConversation} 
          className="w-full justify-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle conversation
        </Button>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <ConversationsList
        conversations={conversations}
        currentConversation={currentConversation}
        searchQuery={searchQuery}
        onSelectConversation={onSelectConversation}
        onRenameClick={handleRenameClick}
        onDeleteClick={handleDeleteClick}
      />

      <RenameDialog
        open={renameDialogOpen}
        title={newTitle}
        onOpenChange={setRenameDialogOpen}
        onTitleChange={setNewTitle}
        onSave={handleRenameSave}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
