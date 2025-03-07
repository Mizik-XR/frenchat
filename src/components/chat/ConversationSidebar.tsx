
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
  MessageSquarePlus
} from "lucide-react";

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
    <div className="w-72 border-r flex flex-col h-full bg-white shadow-sm">
      <div className="p-3 border-b relative">
        <div className="absolute inset-x-0 top-0 h-1 french-flag-gradient"></div>
        <Button 
          className="w-full bg-french-blue hover:bg-french-blue/90 text-white flex items-center justify-center gap-2 rounded-md"
          onClick={onCreateNewConversation}
        >
          <MessageSquarePlus className="h-4 w-4" /> Nouvelle conversation
        </Button>
      </div>

      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            className="pl-8 bg-gray-50 border-gray-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div 
        className="flex items-center px-3 py-2 text-sm font-medium cursor-pointer hover:bg-gray-100 rounded-md mx-2 my-1"
        onClick={() => setShowFolders(!showFolders)}
      >
        {showFolders ? <ChevronDown className="mr-1 h-4 w-4" /> : <ChevronRight className="mr-1 h-4 w-4" />}
        <span className="text-gray-700">Non classées ({filteredConversations.length || 0})</span>
      </div>

      {showFolders && (
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant="ghost"
                  className={`w-full justify-start text-left px-3 py-2 h-auto ${
                    currentConversation?.id === conversation.id 
                    ? "bg-blue-50 text-french-blue border-l-2 border-french-blue" 
                    : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  {conversation.title}
                </Button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Aucune conversation
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      <div className="p-3 border-t">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2 text-gray-700 border-gray-200 hover:bg-gray-50"
        >
          <Folder className="h-4 w-4" /> Nouveau dossier
        </Button>
      </div>
    </div>
  );
}
