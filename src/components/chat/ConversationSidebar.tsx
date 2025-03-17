
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useNavigate } from "react-router-dom";

interface ConversationSidebarProps {
  showTopics: boolean;
  setShowTopics: (show: boolean) => void;
}

export const ConversationSidebar = ({
  showTopics,
  setShowTopics
}: ConversationSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { conversations, isLoading, createNewConversation, activeConversation, setActiveConversation } = useConversations();
  const navigate = useNavigate();

  const handleCreateNewConversation = async () => {
    const newConversation = await createNewConversation();
    if (newConversation) {
      // Utiliser la structure correcte du type Conversation
      setActiveConversation({
        id: newConversation.id,
        title: newConversation.title,
        createdAt: newConversation.created_at,
        updatedAt: newConversation.updated_at,
        // Copier les autres propriétés nécessaires
        is_pinned: newConversation.is_pinned,
        is_archived: newConversation.is_archived,
        folder_id: newConversation.folder_id,
        settings: newConversation.settings,
        user_id: newConversation.user_id
      });
      navigate(`/chat/${newConversation.id}`);
    }
  };

  const handleSelectConversation = (id: string) => {
    const conversation = conversations?.find((conv) => conv.id === id);
    if (conversation) {
      setActiveConversation(conversation);
      navigate(`/chat/${id}`);
    }
  };

  const filteredConversations = conversations?.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 min-w-80 border-r border-border flex flex-col bg-background h-full">
      <div className="p-4 flex flex-col space-y-4">
        <Button 
          onClick={handleCreateNewConversation} 
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

      <div className="flex-1 overflow-auto px-4 py-2">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : filteredConversations?.length === 0 ? (
          <div className="text-center p-4">
            <p className="text-muted-foreground">Aucune conversation trouvée</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filteredConversations?.map((conversation) => (
              <li key={conversation.id}>
                <Button
                  variant={activeConversation?.id === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left overflow-hidden"
                  onClick={() => handleSelectConversation(conversation.id)}
                >
                  <span className="truncate">{conversation.title}</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t">
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => setShowTopics(!showTopics)}
        >
          {showTopics ? "Masquer les sujets" : "Afficher les sujets prioritaires"}
        </Button>
      </div>
    </div>
  );
};
