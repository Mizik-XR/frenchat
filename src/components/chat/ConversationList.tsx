
import { useState, useEffect, useRef } from "react";
import { Plus, Search, Archive, ChevronDown, ChevronRight, Folder, X } from "lucide-react";
import { Conversation } from "@/types/chat";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useConversationFolders } from "@/hooks/useConversationFolders";
import { ConversationGroup } from "./conversation/ConversationGroup";
import { NewFolderDialog } from "./conversation/NewFolderDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onUpdateConversation: (params: { id: string; title?: string; folderId?: string | null; isPinned?: boolean; isArchived?: boolean }) => void;
  onExportToDoc?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  onNew,
  onUpdateConversation,
  onExportToDoc,
  onDelete
}: ConversationListProps) => {
  const { folders, createFolder, deleteFolder } = useConversationFolders();
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Initialiser tous les dossiers comme ouverts par défaut
    const initialState: Record<string, boolean> = {};
    folders.forEach(folder => {
      initialState[folder.id] = true;
    });
    setExpandedFolders(initialState);
  }, [folders]);

  const activeConversations = conversations.filter(conv => !conv.isArchived);
  const archivedConversations = conversations.filter(conv => conv.isArchived);
  const pinnedConversations = activeConversations.filter(conv => conv.isPinned);
  const unpinnedConversations = activeConversations.filter(conv => !conv.isPinned);

  const filteredConversations = (convs: Conversation[]) => {
    if (!searchQuery.trim()) return convs;
    
    return convs.filter(conv => 
      conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleFolderDelete = (folderId: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce dossier ? Les conversations seront déplacées vers 'Non classées'.")) {
      deleteFolder(folderId);
    }
  };

  const resetSearch = () => {
    setSearchQuery("");
    setIsSearchFocused(false);
  };

  // Focus sur la recherche avec raccourci clavier (Ctrl+F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Rendu des icônes de toggle pour les sections
  const renderCollapsibleIcon = (isOpen: boolean) => {
    return isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />;
  };

  return (
    <div className="w-80 h-full border-r border-gray-200 bg-white/90 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="space-y-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  onClick={onNew} 
                  className="w-full gap-2 bg-primary hover:bg-primary/90 text-white transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Nouvelle conversation
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Démarrer une nouvelle conversation (Ctrl+N)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isSearchFocused ? 'text-primary' : 'text-gray-400'}`} />
            <Input
              ref={searchInputRef}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              placeholder="Rechercher une conversation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={resetSearch}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-gray-100 bg-transparent p-0">
          <TabsTrigger 
            value="active" 
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <span className="flex items-center gap-2">
              Actives
              <Badge variant="outline" className="ml-1 bg-gray-100">
                {activeConversations.length}
              </Badge>
            </span>
          </TabsTrigger>
          <TabsTrigger 
            value="archived"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            <span className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Archives
              <Badge variant="outline" className="ml-1 bg-gray-100">
                {archivedConversations.length}
              </Badge>
            </span>
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="active" className="m-0 p-4">
            {pinnedConversations.length > 0 && (
              <Collapsible defaultOpen className="mb-6">
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2 w-full hover:text-gray-700">
                  {renderCollapsibleIcon(true)}
                  Épinglées ({pinnedConversations.length})
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <ConversationGroup
                    conversations={filteredConversations(pinnedConversations)}
                    selectedId={selectedId}
                    onSelect={onSelect}
                    onUpdateConversation={onUpdateConversation}
                    onExportToDoc={onExportToDoc}
                    onDelete={onDelete}
                  />
                </CollapsibleContent>
              </Collapsible>
            )}

            {folders.map((folder) => {
              const folderConversations = filteredConversations(
                unpinnedConversations.filter(conv => conv.folderId === folder.id)
              );

              if (folderConversations.length === 0 && searchQuery) return null;

              const isExpanded = expandedFolders[folder.id];

              return (
                <Collapsible 
                  key={folder.id}
                  open={isExpanded}
                  className="mb-6"
                >
                  <div className="flex items-center justify-between text-sm font-medium text-gray-500 mb-2">
                    <CollapsibleTrigger 
                      className="flex items-center gap-2 hover:text-gray-700"
                      onClick={() => toggleFolder(folder.id)}
                    >
                      {renderCollapsibleIcon(isExpanded)}
                      <Folder className="h-4 w-4" />
                      {folder.name} ({folderConversations.length})
                    </CollapsibleTrigger>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500"
                      onClick={() => handleFolderDelete(folder.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <CollapsibleContent>
                    <ConversationGroup
                      conversations={folderConversations}
                      selectedId={selectedId}
                      onSelect={onSelect}
                      onUpdateConversation={onUpdateConversation}
                      onExportToDoc={onExportToDoc}
                      onDelete={onDelete}
                      folderId={folder.id}
                    />
                  </CollapsibleContent>
                </Collapsible>
              );
            })}

            <Collapsible defaultOpen className="mb-6">
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2 w-full hover:text-gray-700">
                  {renderCollapsibleIcon(true)}
                  Non classées ({filteredConversations(unpinnedConversations.filter(conv => !conv.folderId)).length})
                </CollapsibleTrigger>
              <CollapsibleContent>
                <ConversationGroup
                  conversations={filteredConversations(
                    unpinnedConversations.filter(conv => !conv.folderId)
                  )}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onUpdateConversation={onUpdateConversation}
                  onExportToDoc={onExportToDoc}
                  onDelete={onDelete}
                  folderId={null}
                />
              </CollapsibleContent>
            </Collapsible>

            <NewFolderDialog onCreateFolder={createFolder} />
          </TabsContent>

          <TabsContent value="archived" className="m-0 p-4">
            <ConversationGroup
              conversations={filteredConversations(archivedConversations)}
              selectedId={selectedId}
              onSelect={onSelect}
              onUpdateConversation={onUpdateConversation}
              onExportToDoc={onExportToDoc}
              onDelete={onDelete}
              isArchived={true}
            />
            {archivedConversations.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Archive className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Aucune conversation archivée</p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
