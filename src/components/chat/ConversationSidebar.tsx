
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Folder, Plus, Search, ChevronDown, ChevronRight } from "lucide-react";

interface SidebarProps {
  conversations: any[];
  currentConversation: any;
  onSelectConversation: (id: string) => void;
  onCreateNewConversation: () => void;
}

export function Sidebar({
  conversations,
  currentConversation,
  onSelectConversation,
  onCreateNewConversation,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFolders, setShowFolders] = useState(true);

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
                <Button
                  key={conversation.id}
                  variant="ghost"
                  className={`w-full justify-start mb-1 ${
                    currentConversation?.id === conversation.id ? "bg-accent" : ""
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  {conversation.title}
                </Button>
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
    </div>
  );
}
