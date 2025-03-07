
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, ChevronDown, ChevronRight, Folder } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ConversationsList } from "./conversation/ConversationsList";
import { RenameDialog } from "./conversation/RenameDialog";
import { DeleteDialog } from "./conversation/DeleteDialog";

interface SidebarProps {
  conversations: any[];
  currentConversation: any;
  onSelectConversation: (id: string) => void;
  onCreateNewConversation: () => void;
  onRenameConversation: (params: { id: string, title: string }) => void;
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
  const [showFolders, setShowFolders] = useState(true);
  const [editingConversation, setEditingConversation] = useState<{ id: string, title: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const handleRenameClick = (event: React.MouseEvent, conversation: any) => {
    event.stopPropagation();
    setEditingConversation({ id: conversation.id, title: conversation.title });
    setNewTitle(conversation.title);
  };

  const handleDeleteClick = (event: React.MouseEvent, conversationId: string) => {
    event.stopPropagation();
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const handleSaveRename = async () => {
    if (!editingConversation || !newTitle.trim()) return;
    
    try {
      onRenameConversation({ id: editingConversation.id, title: newTitle.trim() });
      setEditingConversation(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de renommer la conversation",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!conversationToDelete) return;
    
    try {
      onDeleteConversation(conversationToDelete);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la conversation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-72 border-r flex flex-col h-full bg-white">
      <div className="p-4 border-b">
        <Button 
          className="w-full bg-french-blue hover:bg-french-blue/90 text-white flex items-center justify-center" 
          onClick={onCreateNewConversation}
        >
          <Plus className="mr-2 h-4 w-4" /> Nouvelle conversation
        </Button>
      </div>

      <div className="px-4 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center px-4 py-2 text-sm font-medium cursor-pointer" onClick={() => setShowFolders(!showFolders)}>
        {showFolders ? <ChevronDown className="mr-1 h-4 w-4" /> : <ChevronRight className="mr-1 h-4 w-4" />}
        <span>Non classées ({conversations.length || 0})</span>
      </div>

      {showFolders && (
        <ConversationsList
          conversations={conversations}
          currentConversation={currentConversation}
          searchQuery={searchQuery}
          onSelectConversation={onSelectConversation}
          onRenameClick={handleRenameClick}
          onDeleteClick={handleDeleteClick}
        />
      )}

      <div className="p-4 border-t">
        <Button variant="outline" className="w-full flex items-center justify-center">
          <Folder className="mr-2 h-4 w-4" /> Nouveau dossier
        </Button>
      </div>

      {/* Dialogs */}
      <RenameDialog
        open={!!editingConversation}
        title={newTitle}
        onOpenChange={(open) => !open && setEditingConversation(null)}
        onTitleChange={setNewTitle}
        onSave={handleSaveRename}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
