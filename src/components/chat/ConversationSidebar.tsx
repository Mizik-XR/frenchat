
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Folder, 
  Plus, 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Pencil, 
  Trash2 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface SidebarProps {
  conversations: any[];
  currentConversation: any;
  onSelectConversation: (id: string) => void;
  onCreateNewConversation: () => void;
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
  const [showFolders, setShowFolders] = useState(true);
  const [editingConversation, setEditingConversation] = useState<{ id: string, title: string } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
      onRenameConversation(editingConversation.id, newTitle.trim());
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
        <span>Non classées ({filteredConversations.length || 0})</span>
      </div>

      {showFolders && (
        <ScrollArea className="flex-1">
          <div className="px-2">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  className={`flex items-center mb-1 group ${
                    currentConversation?.id === conversation.id ? "bg-accent" : ""
                  }`}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => onSelectConversation(conversation.id)}
                  >
                    {conversation.title}
                  </Button>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => handleRenameClick(e, conversation)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => handleDeleteClick(e, conversation.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-muted-foreground">
                Aucune conversation
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      <div className="p-4 border-t">
        <Button variant="outline" className="w-full flex items-center justify-center">
          <Folder className="mr-2 h-4 w-4" /> Nouveau dossier
        </Button>
      </div>

      {/* Dialogue pour renommer la conversation */}
      <Dialog open={!!editingConversation} onOpenChange={(open) => !open && setEditingConversation(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Renommer la conversation</DialogTitle>
            <DialogDescription>
              Saisissez un nouveau titre pour cette conversation
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Titre de la conversation"
              className="w-full"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingConversation(null)}>
              Annuler
            </Button>
            <Button onClick={handleSaveRename}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement cette conversation ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
