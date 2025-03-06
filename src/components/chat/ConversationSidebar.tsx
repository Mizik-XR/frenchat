
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, Plus, Search, ChevronDown, ChevronRight } from "lucide-react";
import { Conversation } from "@/types/chat";

interface ConversationSidebarProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewConversation: () => void;
}

export function ConversationSidebar({
  conversations,
  selectedConversationId,
  onConversationSelect,
  onNewConversation,
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFolders, setShowFolders] = useState(true);

  const filteredConversations = conversations.filter((conv) =>
    conv.title ? conv.title.toLowerCase().includes(searchQuery.toLowerCase()) : false
  );

  return (
    <div className="w-72 border-r flex flex-col h-full bg-muted/30">
      <div className="p-4">
        <Button className="w-full bg-french-blue hover:bg-french-blue/90 text-white" onClick={onNewConversation}>
          <Plus className="mr-2 h-4 w-4" /> Nouvelle conversation
        </Button>
      </div>

      <div className="px-4 pb-2">
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

      <div className="flex px-4 py-2 text-sm font-medium">
        <Button variant="ghost" className="flex-1 justify-start px-2 h-8" onClick={() => setShowFolders(!showFolders)}>
          {showFolders ? <ChevronDown className="mr-1 h-4 w-4" /> : <ChevronRight className="mr-1 h-4 w-4" />}
          Non classées ({filteredConversations.length})
        </Button>
      </div>

      {showFolders && (
        <ScrollArea className="flex-1">
          <div className="px-2">
            {filteredConversations.map((conversation) => (
              <Button
                key={conversation.id}
                variant="ghost"
                className={`w-full justify-start mb-1 ${
                  selectedConversationId === conversation.id ? "bg-accent" : ""
                }`}
                onClick={() => onConversationSelect(conversation.id)}
              >
                {conversation.title || "Nouvelle conversation"}
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="p-4 border-t">
        <Button variant="outline" className="w-full">
          <Folder className="mr-2 h-4 w-4" /> Nouveau dossier
        </Button>
      </div>
    </div>
  );
}
